---
description: End-of-session sweep — check state + drift, surface every open loop, act on Scott's calls, then go read-only and write a chat-only diary. Usage: /end-session
allowed-tools: Bash(git status:*), Bash(git fetch:*), Bash(git log:*), Bash(git branch:*), Bash(git diff:*), Bash(git rev-list:*), Bash(git for-each-ref:*), Bash(npm run lint:*), Bash(npm test:*), Bash(npm run mutation:*), Bash(npm run build:*), Bash(npm run typecheck:*), Read, Grep, Glob
---

Run the end-of-session protocol. This is a STOP-AND-RECONCILE ritual — only
run it when Scott says "end session" / `/end-session`.

## 1. Check state of everything + drift sweep

- Open PRs and their **CI conclusions on the real code commit** (bot
  `audit:` commits don't retrigger CI — check the last code commit; check
  `npm run mutation`, not just `npm test`).
- Working branch vs `main`; orphaned/unmerged branches; uncommitted work;
  unpushed commits (this container is ephemeral — unpushed = lost).
- A drift pass: stale claims, wrong numbers, evidence-level overclaims
  (e.g. "CI green" claimed off a local run), preflights skipped.

## 2. Close every open question

"Close" means **resolve every dangling question by asking Scott**
(AskUserQuestion), so nothing is left as a silent todo. In auto mode, work
questions were already self-answered by research (WA #2) — what's left for
Scott is merges, scope calls, and anything the Working Agreement reserves
for him. If something genuinely can't be resolved, state why.

## 3. List it all for Scott to audit

One scannable list — PRs (state + CI), branches, open loops, drift findings,
security flags (if any fired, they already full-stopped the session — WA #1).
**Surface, don't decide.**

## 4. Do whatever Scott says

Act on his calls. **Merges are his alone — never merge, even here (WA #12).**
Branches/work not from this session are surfaced, never touched without his
say-so.

## 5. Only AFTER the final push, switch to READ-ONLY

No more repo writes/commits/pushes. Then write the session **diary in chat
only** — never a committed JOURNAL/handoff file (persistence is the repo +
PRs, not a handoff doc).
