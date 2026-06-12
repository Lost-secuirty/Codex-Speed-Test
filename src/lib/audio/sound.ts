// The only audio entry point (AGENTS.md · Project structure). PR3 (ADR-0015):
// playCue is now a REGISTRY facade — prototypes register their cue→intent
// tables (typed at THEIR layer against their own contracts) and the synth
// player (playback.ts) renders them; names without a registered intent fall
// back to the scaffold's placeholder beeps (reel-spin-shell stays beeping).
// Every cue is logged unconditionally so tests and verify.mjs assert sound
// behavior headlessly — the log is the pure, deterministic surface; the
// audible layer never affects it.

import { sound } from '@pixi/sound';
import type { BusName, CueIntent } from './cue-model';
import { createPlayback, type Playback, type PlayOpts } from './playback';

// --- the scaffold's legacy beep vocabulary (fallback when no intent is
//     registered for a name) ---
interface BeepSpec {
  frequency: number;
  durationMs: number;
  type: OscillatorType;
}

const BEEPS: Record<string, BeepSpec> = {
  'spin-start': { frequency: 440, durationMs: 120, type: 'square' },
  'reel-stop': { frequency: 660, durationMs: 80, type: 'triangle' },
  'spin-settle': { frequency: 880, durationMs: 220, type: 'sine' },
};

let muted = false;
let ctx: AudioContext | null = null;
let playback: Playback | null = null;
const cueLog: string[] = [];
const intents = new Map<string, CueIntent>();
let defaultOpts: PlayOpts = {};

function audioContext(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  ctx ??= new AudioContext();
  return ctx;
}

/** Register a prototype's cue→intent table (last registration wins per name).
 *  `defaults` carries table-wide play options (winFloor, voiceCap). */
export function registerCueIntents(
  table: Record<string, CueIntent>,
  defaults: PlayOpts = {},
): void {
  for (const [name, intent] of Object.entries(table)) intents.set(name, intent);
  defaultOpts = { ...defaultOpts, ...defaults };
}

/** Resume the AudioContext from a user gesture (autoplay policy). Safe to
 *  call repeatedly; no-op when audio is unavailable. */
export function resumeAudio(): void {
  const ac = audioContext();
  if (ac && ac.state === 'suspended') void ac.resume();
}

/** Drive a bus level (the arousal curve's seam, ADR-0015). No-op headlessly. */
export function setBusLevel(bus: BusName, level: number, rampMs?: number): void {
  if (muted) return;
  const ac = audioContext();
  if (!ac) return;
  playback ??= createPlayback(ac);
  playback.setBusLevel(bus, level, rampMs);
}

/** Play a named cue (logged always; audible unless muted/unavailable). */
export function playCue(name: string, opts: PlayOpts = {}): void {
  cueLog.push(name);
  if (cueLog.length > 100) cueLog.shift();
  if (muted) return;
  const ac = audioContext();
  if (!ac) return;

  const intent = intents.get(name);
  if (intent) {
    playback ??= createPlayback(ac);
    playback.play(intent, { ...defaultOpts, ...opts });
    return;
  }
  const spec = BEEPS[name];
  if (!spec) return; // unknown name: logged, silent — the log IS the contract
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = spec.type;
  osc.frequency.value = spec.frequency;
  gain.gain.setValueAtTime(0.12, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + spec.durationMs / 1000);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + spec.durationMs / 1000);
}

/** The cues played so far (capped) — the headless-testable sound surface. */
export function playedCues(): readonly string[] {
  return cueLog;
}

/** Mute/unmute both the synth/beep cues and @pixi/sound-registered assets. */
export function setMuted(value: boolean): void {
  muted = value;
  if (value) sound.muteAll();
  else sound.unmuteAll();
}

export function isMuted(): boolean {
  return muted;
}

/** Register a file-based sound asset (goes through @pixi/sound). */
export function registerSound(alias: string, url: string): void {
  if (!sound.exists(alias)) sound.add(alias, url);
}

/** Play a registered file-based sound asset. */
export function playSound(alias: string): void {
  if (muted) return;
  if (sound.exists(alias)) void sound.play(alias);
}
