// The only audio entry point (AGENTS.md · Project structure). File-based
// assets register through @pixi/sound; the placeholder cues are
// runtime-generated WebAudio beeps — zero binary assets, zero licensing
// (ADR-0005) — so the hook points are real from day one. Every cue is
// logged so tests and verify.mjs can assert sound behavior headlessly.

import { sound } from '@pixi/sound';

export type CueName = 'spin-start' | 'reel-stop' | 'spin-settle';

interface CueSpec {
  frequency: number;
  durationMs: number;
  type: OscillatorType;
}

const CUES: Record<CueName, CueSpec> = {
  'spin-start': { frequency: 440, durationMs: 120, type: 'square' },
  'reel-stop': { frequency: 660, durationMs: 80, type: 'triangle' },
  'spin-settle': { frequency: 880, durationMs: 220, type: 'sine' },
};

let muted = false;
let ctx: AudioContext | null = null;
const cueLog: CueName[] = [];

function audioContext(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  ctx ??= new AudioContext();
  return ctx;
}

/** Play a named cue (logged always; audible unless muted/unavailable). */
export function playCue(name: CueName): void {
  cueLog.push(name);
  if (cueLog.length > 100) cueLog.shift();
  if (muted) return;
  const ac = audioContext();
  if (!ac) return;
  const spec = CUES[name];
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
export function playedCues(): readonly CueName[] {
  return cueLog;
}

/** Mute/unmute both the beep cues and any @pixi/sound-registered assets. */
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
