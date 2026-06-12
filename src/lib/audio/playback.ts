// The ONLY WebAudio file (ADR-0015): a thin synth player over the pure
// cue-model. No game knowledge — it renders CueIntents into a four-bus graph.
// Everything is synthesized (zero binary assets, ADR-0005); every envelope
// runs through clampAttack so the ≥120ms law is enforced at the audio edge
// too, not just in the table. Takes a BaseAudioContext so tests can render
// into an OfflineAudioContext (gesture-exempt) deterministically.

import {
  type BusName,
  type CueIntent,
  clampAttack,
  shepardLayerGain,
  swarmVoices,
  winGainForProximity,
} from './cue-model';

export interface PlayOpts {
  /** figure proximity 0..1 — ducks the events bus per winGainForProximity. */
  proximity?: number;
  /** events-bus gain at proximity 1 (config.audio.winFloor). */
  winFloor?: number;
  /** swarm grain voices wanted (capped by `voiceCap`). */
  voices?: number;
  voiceCap?: number;
}

export interface Playback {
  play: (intent: CueIntent, opts?: PlayOpts) => void;
  /** bus gain (0..1) — the arousal curve drives bed/mid between phases. */
  setBusLevel: (bus: BusName, level: number, rampMs?: number) => void;
  dispose: () => void;
}

/** Tiny deterministic LCG so grain scatter is reproducible (no Math.random). */
function lcg(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export function createPlayback(ctx: BaseAudioContext): Playback {
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  const buses: Record<BusName, GainNode> = {
    bed: ctx.createGain(),
    mid: ctx.createGain(),
    events: ctx.createGain(),
    stingers: ctx.createGain(),
  };
  for (const b of Object.values(buses)) b.connect(master);

  /** Attack-clamped envelope: 0 → peak over attack, then decay to silence by
   *  end — or HOLD at peak forever when sustained (the bed, audit H2). */
  function env(
    g: GainNode,
    t0: number,
    attackMs: number,
    durationMs: number,
    peak: number,
    sustain = false,
  ): void {
    const a = clampAttack(attackMs) / 1000;
    const end = t0 + durationMs / 1000;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(Math.max(peak, 0.0001), t0 + a);
    if (!sustain) g.gain.exponentialRampToValueAtTime(0.0001, Math.max(end, t0 + a + 0.01));
  }

  function osc(
    type: OscillatorType,
    freq: number,
    bus: GainNode,
    t0: number,
    attackMs: number,
    durationMs: number,
    peak: number,
    sustain = false,
  ): OscillatorNode {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    env(g, t0, attackMs, durationMs, peak, sustain);
    o.connect(g);
    g.connect(bus);
    o.start(t0);
    // a sustained source never schedules its own stop — dispose() ends it.
    if (!sustain) o.stop(t0 + durationMs / 1000 + 0.05);
    return o;
  }

  /** monotonically folds into the grain seed — varied but deterministic. */
  let grainStep = 0;
  /** One bar of pre-rendered noise, reused by grain/noise-tick. */
  let noiseBuf: AudioBuffer | null = null;
  function noise(): AudioBuffer {
    if (noiseBuf) return noiseBuf;
    const len = Math.floor(ctx.sampleRate * 0.5);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    const rnd = lcg(0x5eed);
    for (let i = 0; i < len; i++) data[i] = rnd() * 2 - 1;
    return noiseBuf;
  }

  function noiseBurst(
    bus: GainNode,
    t0: number,
    attackMs: number,
    durationMs: number,
    peak: number,
    bandHz: number,
  ): void {
    const src = ctx.createBufferSource();
    src.buffer = noise();
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = bandHz;
    f.Q.value = 2.5;
    const g = ctx.createGain();
    env(g, t0, attackMs, durationMs, peak);
    src.connect(f);
    f.connect(g);
    g.connect(bus);
    src.start(t0);
    src.stop(t0 + durationMs / 1000 + 0.05);
  }

  function play(intent: CueIntent, opts: PlayOpts = {}): void {
    const t0 = ctx.currentTime;
    const bus = buses[intent.bus];
    const durS = intent.durationMs / 1000;
    // dread outranks juice: the events bus ducks as the figure nears.
    const gain =
      intent.bus === 'events'
        ? intent.gain * winGainForProximity(opts.proximity ?? 0, opts.winFloor ?? 0.35)
        : intent.gain;

    switch (intent.kind) {
      case 'drone': {
        // 3 detuned lows + a missing-fundamental stack (2f/3f/4f imply freq
        // below what small speakers reproduce — the felt low end, ADR-0015).
        // sustain (the bed) holds at peak and never self-stops (audit H2).
        const sus = intent.sustain ?? false;
        for (const det of [-0.7, 0, 0.8]) {
          osc(
            'sawtooth',
            intent.freq + det,
            bus,
            t0,
            intent.attackMs,
            intent.durationMs,
            gain * 0.25,
            sus,
          );
        }
        for (const h of [2, 3, 4]) {
          osc(
            'sine',
            intent.freq * h,
            bus,
            t0,
            intent.attackMs,
            intent.durationMs,
            gain * (0.3 / h),
            sus,
          );
        }
        break;
      }
      case 'glass': {
        // a minor-2nd pair — consonance withheld (the ambiguity layer).
        osc('sine', intent.freq, bus, t0, intent.attackMs, intent.durationMs, gain * 0.6);
        osc(
          'sine',
          intent.freq * 1.0595,
          bus,
          t0,
          intent.attackMs + 80,
          intent.durationMs,
          gain * 0.4,
        );
        break;
      }
      case 'blip': {
        osc('triangle', intent.freq, bus, t0, intent.attackMs, intent.durationMs, gain);
        break;
      }
      case 'arp': {
        // cold minor arpeggio (root, m3, 5) — extractive contour, horror timbre.
        const steps = [1, 1.1892, 1.4983];
        steps.forEach((ratio, i) => {
          const at = t0 + i * 0.09;
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          const f = ctx.createBiquadFilter();
          f.type = 'lowpass';
          f.frequency.value = 1200;
          o.type = 'triangle';
          o.frequency.value = intent.freq * ratio;
          env(g, at, intent.attackMs, intent.durationMs - i * 90, gain * (1 - i * 0.18));
          o.connect(f);
          f.connect(g);
          g.connect(bus);
          o.start(at);
          o.stop(at + durS);
        });
        break;
      }
      case 'descend': {
        // the honest unmask: a falling minor 2nd (ADR-0014).
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(intent.freq, t0);
        o.frequency.linearRampToValueAtTime(intent.freq * 0.9439, t0 + durS);
        env(g, t0, intent.attackMs, intent.durationMs, gain);
        o.connect(g);
        g.connect(bus);
        o.start(t0);
        o.stop(t0 + durS + 0.05);
        break;
      }
      case 'shepard': {
        // one STEP of the endless rise: octave-spaced layers under the raised-
        // cosine window, all gliding up a half octave; proximity rotates the
        // window so successive steps feel ever-higher without resolving.
        const layers = 6;
        const rot = opts.proximity ?? 0;
        for (let i = 0; i < layers; i++) {
          const pos = (i / layers + rot) % 1;
          const f0 = intent.freq * 2 ** (i % layers);
          const layerGain = gain * shepardLayerGain(pos) * 0.35;
          if (layerGain < 0.005) continue;
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(f0, t0);
          o.frequency.exponentialRampToValueAtTime(f0 * 1.414, t0 + durS);
          env(g, t0, intent.attackMs, intent.durationMs, layerGain);
          o.connect(g);
          g.connect(bus);
          o.start(t0);
          o.stop(t0 + durS + 0.05);
        }
        break;
      }
      case 'grain': {
        // the swarm: capped, seeded noise grains scattered over the window.
        // grainStep folds into the seed so successive bursts differ while
        // staying deterministic per playback instance (audit L6).
        const n = swarmVoices(opts.voices ?? 8, opts.voiceCap ?? 24);
        grainStep += 1;
        const rnd = lcg(Math.floor(intent.freq) + n + grainStep * 7919);
        for (let i = 0; i < n; i++) {
          const at = t0 + rnd() * Math.max(durS - 0.06, 0.01);
          noiseBurst(
            bus,
            at,
            intent.attackMs,
            60 + rnd() * 70,
            gain * (0.5 + rnd() * 0.5),
            intent.freq * (0.8 + rnd() * 0.4),
          );
        }
        break;
      }
      case 'cut-swell': {
        // escalation by SUBTRACTION (ADR-0015): cut the bed to silence, hold,
        // then swell the low stack; the bed creeps back after.
        const silence = Math.min(0.25 * durS, 0.6);
        // restore the bed to its PRE-CUT level, not a hardcoded 1 — otherwise
        // the cut would stomp whatever arousal level is in force (audit H3).
        const bedBefore = buses.bed.gain.value;
        buses.bed.gain.cancelScheduledValues(t0);
        buses.bed.gain.setValueAtTime(bedBefore, t0);
        buses.bed.gain.linearRampToValueAtTime(0.0001, t0 + 0.2);
        buses.bed.gain.setValueAtTime(0.0001, t0 + 0.2 + silence);
        buses.bed.gain.linearRampToValueAtTime(Math.max(bedBefore, 0.0001), t0 + durS + 1.5);
        const at = t0 + 0.2 + silence;
        for (const h of [1, 2, 3]) {
          osc(
            'sine',
            intent.freq * h,
            bus,
            at,
            intent.attackMs,
            intent.durationMs,
            gain * (0.7 / h),
          );
        }
        noiseBurst(
          bus,
          at,
          intent.attackMs,
          intent.durationMs * 0.6,
          gain * 0.25,
          intent.freq * 30,
        );
        break;
      }
      case 'noise-tick': {
        noiseBurst(bus, t0, intent.attackMs, intent.durationMs, gain, intent.freq);
        break;
      }
    }
  }

  function setBusLevel(bus: BusName, level: number, rampMs = 400): void {
    const t0 = ctx.currentTime;
    const g = buses[bus].gain;
    g.cancelScheduledValues(t0);
    g.setValueAtTime(g.value, t0);
    g.linearRampToValueAtTime(Math.max(0.0001, Math.min(level, 1)), t0 + rampMs / 1000);
  }

  function dispose(): void {
    master.disconnect();
  }

  return { play, setBusLevel, dispose };
}
