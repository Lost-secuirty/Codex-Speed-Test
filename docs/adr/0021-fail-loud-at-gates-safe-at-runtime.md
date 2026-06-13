# 0021. Fail loud at the gates, fail safe-but-observable at runtime

- **Status:** Accepted
- **Date:** 2026-06-13

## Context

A "dice-duel reliability lab" (a throwaway dice game wrapped in an elaborate
testing/durability workflow) was mined for patterns worth importing here. The
game was disposable; three ideas were not, and a short web pass confirmed each
is settled practice, not folklore:

- **Mutation provenance.** Surviving mutants are test blind spots; the
  discipline is to close each with a *named* test and iterate. Mutation
  analysis is run on essentially all changes by 6,000+ engineers at Google
  ([State of Mutation Testing at Google](https://research.google/pubs/state-of-mutation-testing-at-google/)).
- **Fail visible, not silent.** Fail-fast at gates and critical paths; degrade
  gracefully at non-essential runtime paths — but *never* by swallowing the
  failure. Exception-swallowing (catch → return null/false with no signal) is
  the named anti-pattern; "regardless of fail-fast or fail-safe, failure must
  be visible to whoever owns the system"
  ([fail-fast vs graceful degradation](https://designgurus.substack.com/p/when-to-fail-fast-vs-degrade-gracefully)).
- **Detection is not durability.** Durable state needs an atomic write
  (temp → fsync → rename → fsync dir) **and** a recoverable last-known-good
  generation; merely *detecting* corruption is not surviving it
  ([LWN: a way to do atomic writes](https://lwn.net/Articles/789600/),
  [crash-safe JSON: atomic writes + recovery](https://dev.to/constanta/crash-safe-json-at-scale-atomic-writes-recovery-without-a-db-3aic)).

These cohere into one doctrine the repo was applying by instinct but had never
written down — and the writing-down exposed two gaps.

## Decision

Adopt a single rule with two halves, and make each half executable where it
wasn't:

**1. Enforcement code fails LOUD.** Gates, probes, guards, the build, and the
secret scanner exit non-zero with a named failure and never report green while
inert. Gates may be strengthened, never narrowed (ADR-0007). Two strengthenings
land with this ADR:

- **`scripts/file-guard.mjs` + `npm run guard`** — a sha256 freeze over the
  *executable* safety machinery (the audit/probe/canary/preflight scripts, the
  GritQL footgun plugins, `tools/scan_staged.py`, the pre-commit hook, the
  build/test configs, and the guard itself). It turns the ADR-0007 invariant
  "the audit system may not loosen itself" into a hard tripwire: any byte change
  fails preflight until the baseline (`.fileguard.json`) is re-snapshotted, and
  that bump then shows up in the reviewed diff. It is **tamper-evident, not
  tamper-proof** — a change plus a re-snapshot in the same commit passes; the
  guard only forces the pair in front of a human. It is the loud, content-
  addressed complement to audit-drift's medium, ref-relative `sensitive-paths`
  nag (which goes vacuous on a bad base ref; the guard does not). It runs in
  both the local preflight gate and the CI `checks` job, and is proven to bite
  by a new gate-canary case.
- **Mutation provenance** — `scripts/mutation-probe.mjs` now requires every
  mutant to name the unit suite meant to kill it (resolved via `FILE_TO_TEST`)
  and prints that suite on SURVIVED. A new module with no registered suite fails
  the probe loud, rather than silently lacking coverage. **Limitation, stated
  honestly:** this is *existence-checked, not kill-attributed* — the validator
  proves the named suite *exists*, not that it is the test that actually fails
  on the mutant (the probe still runs the whole unit project per mutant, so a
  KILL may come from an unrelated test). Machine-verified kill attribution
  (parse the failing suite and assert it is the declared one) is a future
  option; today the value is the forced, reviewed *pointer*, not a proof.

**2. Runtime user-facing code degrades GRACEFULLY — but never silently.**
Play-money UI code (storage, audio, render) must not crash on a recoverable
fault; it falls back. But "fell back" must be *observable* (a dev-mode signal /
counter) and load-bearing persisted state must be *validated on read* with a
previous-good fallback, not blindly trusted. This is the browser analog of
temp+rename+last-known-good.

## Consequences

- The safety machinery can no longer be edited quietly; legitimate edits cost
  one `npm run guard -- --update` and a visible `.fileguard.json` diff. That
  friction is the feature.
- Adding a mutant now forces you to point at a killing test — an
  existence-checked gate, not a comment (it does not yet attribute the kill to
  the named suite; see the limitation above).
- **Known CI interaction (dormant):** the drift audit (`audit.yml`) auto-commits
  `biome check --write` fixes; `ci.yml`'s `npm run guard` step runs on the
  resulting commit. If a future PR ever lands a *guarded* file slightly
  unformatted, that auto-fix would reformat-and-commit it without re-snapshotting
  `.fileguard.json`, and the guard would then fail on the bot commit. Dormant
  today (all guarded files are biome-clean; the only auto-commit here touched
  `docs/audit-history.ndjson`, which is unguarded). If it ever fires, the fix is
  to re-baseline in the same PR — which is exactly the guard doing its job
  (an unreviewed change to safety code), just inconveniently late.
- **Flagged, not fixed (design-only, this ADR's scope):** `src/lib/storage.ts`
  is today the *correct* shape of half 2 (it degrades on miss/corrupt/quota/
  private-mode instead of throwing) but the *wrong* loudness — all three catches
  are empty, so a corrupted value is indistinguishable from a missing key and
  resets to default with zero signal, and there is no corruption detection. A
  **future PR** (proposed, not enacted here) should: add a dev-mode warn/counter
  on the fallback paths; and offer an opt-in versioned wrapper (schema-tagged
  key + validate-on-read + a `:prev` previous-good copy) for any key whose loss
  is user-visible. Kept out of this PR deliberately — the chosen scope was the
  design note.
- **Not ported (and why):** the dice-lab's in-place *idempotent patcher* (a
  script that edits a test file with an anchor + drift-guard + backup) solves a
  problem git already solves here — traceable, revertible, reviewable test
  additions are what a PR *is*. Importing it would add a bespoke mechanism for a
  guarantee version control already gives. The transferable essence (every
  survivor ⇒ a named, committed test) is kept; the mechanism is dropped.

## Alternatives considered

- **Lean on audit-drift's `sensitive-paths` finding alone** — why not: it is a
  medium, non-blocking nag, computed against a git ref, and goes vacuously green
  when the base ref is unresolvable. It flags that a gate file *appears in a
  diff*; it cannot assert the safety machinery still *hashes to its reviewed
  state*. The guard is the hard, ref-independent backstop.
- **Make the file-guard tamper-proof (reject any change to protected files)** —
  why not: the safety machinery legitimately evolves (this very PR changes four
  guarded files). Prevention would block normal work; evidence + mandatory human
  review in the diff is the right altitude.
- **Fix storage.ts observability in this PR** — why not: the chosen scope was a
  design note, and the responsible-default vs extractive-opt-in shape of the
  versioned wrapper deserves its own reviewed change, not a drive-by.
