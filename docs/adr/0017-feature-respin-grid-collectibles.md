# 0017. The LIGHTS OUT respin grid renders collectibles, not entry symbols

- **Status:** Accepted
- **Date:** 2026-06-12

## Context

The PR2 meta-audit (finding F4) flagged a seam in `resolveFeature`: the *initial*
lock reads the entry board's symbols (`lockableCells`), but every subsequent
respin (`rollRespin`) lights up free cells by seeded RNG, **decoupled from what
symbol sits on that cell**. So `accumulator.locked` can include a cell whose
entry-board symbol was `rad`/`mainst`/filler. Left unspecified, the presenter
might draw the swarm-unit eye-pair "locking" onto a mailbox tile — a visible
diegetic contradiction, and exactly the kind of incomplete-spec handoff the
meta-audit exists to catch before presenter code is written.

## Decision

**When LIGHTS OUT triggers, the board becomes the respin grid and the entry
board is left behind.** Every **locked** cell renders as the captured-value
collectible — the swarm-unit tile showing its value — and every **unlocked**
cell renders dark/empty. The entry board's filler symbols do not carry into the
feature; they were only the trigger frame.

This mirrors how real hold&win respin reels work (they contain only blanks and
the collectible symbol), and it removes the symbol/lock mismatch *by
construction* — there are no mismatched symbols because the feature grid only
ever shows collectibles and blanks. The presenter reads exactly two things from
the resolver during the feature: `accumulator.locked` (which cells are lit) and
each tile's value; it never consults the entry board's symbols mid-feature. The
`hiddenValues` toggle (ADR-0013) governs only *when* the value is shown (live vs
on the flashlight reveal sweep), not which cells light up.

## Consequences

- The feature renderer is simple and deterministic: locked → collectible tile +
  value, else dark. Maps `accumulator.locked` flat indices back to `(reel,row)`
  via `holdwin.cellCoord` (added in PR2 for exactly this).
- `resolveFeature`'s symbol-blind respin is **correct, not a bug** — this ADR
  records why, so a future reader doesn't "fix" it back into a coupling.
- The entry board is still used by the base game and for the one-frame trigger
  flash before the grid converts.
- The third (visible-value) visual baseline captures a frozen feature frame,
  where every locked cell shows its value — independent of entry symbols.

## Alternatives considered

- **Constrain respins to land only on hold-symbol cells** — rejected: real
  hold&win doesn't, and it would couple the resolver to symbol placement and
  shrink the jackpot space arbitrarily.
- **Lazily overwrite the entry symbol on lock** — same visual result, more
  presenter state; the "grid replaces the board" framing is cleaner.
