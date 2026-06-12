// Single source of truth for the prototype catalog (ADR-0004): drives both
// the root index page and the Vite multi-entry build. Adding a prototype =
// one folder under src/prototypes/ + one entry here + a visual test.

export interface PrototypeEntry {
  /** Folder name under src/prototypes/ — also the Vite entry id. */
  id: string;
  title: string;
  /** One line: what this prototype explores or proves. */
  description: string;
}

export const prototypes: PrototypeEntry[] = [
  {
    id: 'reel-spin-shell',
    title: 'Reel Spin Shell',
    description:
      'The scaffold proof: 3 procedural reels, GSAP spin over pure reel-math, sound hooks, visual baseline.',
  },
];
