# 0022. Durable opt-in storage wrapper + the determinism / RNG-isolation gate

- **Status:** Accepted
- **Date:** 2026-06-13

## Context

An uploaded Python slot build (`slot_machine.py`) was swept for patterns worth
salvaging. Two survived an adversarial web check and map onto deferred gaps; the
rest (exact-KAT/exhaustive/statistical math) were already present-and-stronger in
the public math repo (nothing to port). This ADR enacts:

- the two **ADR-0021 follow-ups** for `src/lib/storage.ts` — observability on the
  silent-degrade path, and a versioned/previous-good wrapper; and
- the **determinism gap (A1)** — nothing in the stack proved the unit suite is
  order/clock invariant.

Web-validated bases: inject the RNG and protect critical code with a dedicated
instance; randomize test order to surface inter-test deps; a durable write needs
*recovery* (last-known-good), not just corruption *detection*. The durability
*form* in the Python build (CSV main+backup+manifest+`fsync`/atomic-rename) is
**wrong for a browser** — localStorage is synchronous, a single `setItem` is
atomic, there is no `fsync`. So we keep only the transferable essence.

## Decision

**1. Durable opt-in API in `src/lib/storage.ts` (`saveDurable` / `loadDurable`).**
For load-bearing keys only: a schema-version tag, a caller-supplied
validate-on-read typeguard, ONE previous-good copy (`:prev` sibling, promoted
only after the current record re-validates), and read fall-through
current→previous→default. The fallback is **observable** — a `durableFallbackCount()`
counter plus a dev-mode `console.warn` — closing the ADR-0021 silent-swallow gap.
The existing silent `loadJSON`/`saveJSON`/`removeKey` stay unchanged as the
**responsible default** for non-load-bearing keys (the durable API is the opt-in,
not the replacement). Durable records are wrapped (`{ v, data }`), so they are
deliberately not `loadJSON`-readable (a one-way door). Five mutation mutants pin
the validate/version/previous-good/counter logic.

**2. Determinism / RNG-isolation gate (A1).** `scripts/determinism.mjs` runs the
unit project twice under perturbation — a different `sequence.seed` AND a different
timezone — and fails loud, naming any test whose pass/fail **flips** (order- or
clock-dependence). Wired into `preflight` (after `mutation`) and the CI `checks`
job, and proven to bite by a new `canaryDeterminism` (clean hermetic suite passes;
a clock-dependent test flips and is caught). The `unit` project now shuffles with a
fixed seed (reproducible) so `npm test` itself is order-randomized. `mulberry32`
gains isolation tests (no global `Math.random` read/advance; instances independent)
— `src/lib/rng.ts` needs no source change (already a pure closure).

## Consequences

- `file-guard` now freezes **19** files (adds `scripts/determinism.mjs`); a new
  gate script that could be silently softened is exactly what the guard exists for.
- Preflight/CI cost: +1 unit-suite run for the determinism gate (the suite is
  small; wall-time creep is a tracked LEARNINGS suspicion — shard later if needed).
- `:prev` is a **reserved** key suffix; durable records are not interchangeable
  with `loadJSON` values.
- **Honest scope note:** `storage.ts` currently has **no `src/` callers**, so the
  durable API is *pre-emptive lib hardening + killing the silent swallow*, not a
  live-bug fix. The determinism gate, by contrast, protects the whole live suite.

## Alternatives considered

- **Port the Python `fsync`/manifest/backup-file machinery** — why not: wrong
  altitude for synchronous localStorage; it would be cargo-culting durability
  ceremony with no `fsync`/rename to back it.
- **Replace `loadJSON` with the durable API** — why not: it would break the
  storage-firewall-blessed signatures and the two existing storage mutants, and
  force durability ceremony on non-load-bearing keys.
- **Only assert RNG determinism (no suite-wide gate)** — why not: per-test seed
  replay doesn't catch *inter-test* order coupling or a wall-clock reader; the
  shuffle+TZ gate does.
