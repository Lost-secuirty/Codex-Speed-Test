// GSAP helpers for the house animation style — keep the easing vocabulary
// here so prototypes share one feel and swaps stay cheap.

import { gsap } from 'gsap';

/** Tween a display object's y to a target with the house "reel" feel. */
export function reelSpinTo(
  target: { y: number },
  y: number,
  durationMs: number,
  onComplete?: () => void,
): gsap.core.Tween {
  return gsap.to(target, {
    y,
    duration: durationMs / 1000,
    ease: 'back.out(0.9)',
    onComplete,
  });
}

/** Quick anticipation pulse for buttons/wins (scale out and back). */
export function pulse(
  target: { scale: { x: number; y: number } },
  amount = 1.08,
): gsap.core.Timeline {
  const tl = gsap.timeline();
  tl.to(target.scale, { x: amount, y: amount, duration: 0.08, ease: 'power2.out' });
  tl.to(target.scale, { x: 1, y: 1, duration: 0.18, ease: 'back.out(2)' });
  return tl;
}

/** Kill all tweens on a target (cleanup when tearing a scene down). */
export function killTweens(target: object): void {
  gsap.killTweensOf(target);
}
