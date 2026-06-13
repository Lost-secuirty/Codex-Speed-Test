// PR3 (ADR-0015): the synth layer probed in REAL WebAudio via
// OfflineAudioContext — gesture-exempt and deterministic, so CI needs no
// autoplay hacks and no flake budget (docs/kb/webaudio.md). Two proofs:
// every SPOKEY intent renders audibly through every synth path, and the
// ≥120ms attack law holds in the SAMPLES, not just in the table.

import { describe, expect, it } from 'vitest';
import { createPlayback } from '../../src/lib/audio/playback';
import { SPOKEY_CUES } from '../../src/prototypes/spokey-lights-out/cues';

function rms(data: Float32Array, sr: number, fromS: number, toS: number): number {
  const a = Math.floor(fromS * sr);
  const b = Math.min(Math.floor(toS * sr), data.length);
  let sum = 0;
  for (let i = a; i < b; i++) sum += (data[i] ?? 0) ** 2;
  return Math.sqrt(sum / Math.max(b - a, 1));
}

describe('playback in OfflineAudioContext', () => {
  it('renders every SPOKEY cue audibly (all synth kinds, no throws)', async () => {
    const sr = 44100;
    const ctx = new OfflineAudioContext(1, sr * 2, sr);
    const pb = createPlayback(ctx);
    for (const intent of Object.values(SPOKEY_CUES)) {
      pb.play(intent, { proximity: 0.5, voices: 6, voiceCap: 24 });
    }
    const buf = await ctx.startRendering();
    expect(rms(buf.getChannelData(0), sr, 0, 2)).toBeGreaterThan(0.0005); // not silence
  });

  it('the relief cue resolves audibly with a slow (non-startle) onset (ADR-0020)', async () => {
    const sr = 44100;
    const ctx = new OfflineAudioContext(1, sr * 3, sr);
    createPlayback(ctx).play(SPOKEY_CUES.relief);
    const buf = await ctx.startRendering();
    const data = buf.getChannelData(0);
    const start = rms(data, sr, 0, 0.02); // first 20ms: near-silent under a 600ms attack
    const peak = rms(data, sr, 0.6, 1.2); // after the attack completes
    expect(peak).toBeGreaterThan(0.001); // the resolution is audible
    expect(start).toBeLessThan(peak * 0.2); // slow swell, not a jump-in
  });

  it('the ≥120ms attack law holds in the rendered samples (startle gate)', async () => {
    const sr = 44100;
    const ctx = new OfflineAudioContext(1, sr, sr);
    const pb = createPlayback(ctx);
    pb.play(SPOKEY_CUES['near-miss']); // glass: 200ms attack, 900ms duration
    const buf = await ctx.startRendering();
    const data = buf.getChannelData(0);
    const start = rms(data, sr, 0, 0.01); // first 10ms: near-silent
    const early = rms(data, sr, 0, 0.08); // mid-ramp: clearly below peak
    const peak = rms(data, sr, 0.2, 0.4); // at/after the attack completes
    expect(peak).toBeGreaterThan(0.001); // audible at all
    expect(start).toBeLessThan(peak * 0.15); // no instant onset
    expect(early).toBeLessThan(peak * 0.6); // the rise is a RAMP, not a step
  });

  it('the clamp catches a too-fast intent at the audio edge (synthetic 10ms attack)', async () => {
    // a hostile/buggy table entry must STILL ramp ≥120ms in the samples —
    // this pins env()'s clampAttack, which the table tests cannot (audit H4).
    const sr = 44100;
    const ctx = new OfflineAudioContext(1, sr, sr);
    createPlayback(ctx).play({
      bus: 'events',
      kind: 'blip',
      freq: 311,
      attackMs: 10, // illegal — the clamp must stretch it to 120ms
      durationMs: 800,
      gain: 0.5,
    });
    const buf = await ctx.startRendering();
    const data = buf.getChannelData(0);
    // 0–40ms sits mid-ramp under a 120ms clamp (~0.2·peak RMS) but at FULL
    // level if the 10ms attack were honored — a wide, stable discriminator.
    const early = rms(data, sr, 0, 0.04);
    const peak = rms(data, sr, 0.12, 0.18); // right after the clamped attack
    expect(peak).toBeGreaterThan(0.001);
    expect(early).toBeLessThan(peak * 0.5);
  });

  it('the bed SUSTAINS — still audible long after its swell (audit H2)', async () => {
    const sr = 44100;
    const ctx = new OfflineAudioContext(1, sr * 8, sr);
    createPlayback(ctx).play(SPOKEY_CUES['drone-start']);
    const buf = await ctx.startRendering();
    const data = buf.getChannelData(0);
    const swell = rms(data, sr, 5, 6); // post-swell plateau
    const late = rms(data, sr, 7, 8); // well past durationMs (6s)
    expect(swell).toBeGreaterThan(0.001);
    expect(late).toBeGreaterThan(swell * 0.5); // held, not decayed to silence
  });

  it('proximity ducks the events bus (dread outranks juice, in samples)', async () => {
    const sr = 44100;
    const render = async (proximity: number) => {
      const ctx = new OfflineAudioContext(1, sr, sr);
      createPlayback(ctx).play(SPOKEY_CUES['reel-stop'], { proximity });
      const buf = await ctx.startRendering();
      return rms(buf.getChannelData(0), sr, 0, 0.5);
    };
    const safe = await render(0);
    const near = await render(1);
    expect(near).toBeLessThan(safe * 0.6); // ducked toward the 0.35 floor
    expect(near).toBeGreaterThan(0.0001); // but never silenced
  });
});
