---
description: Preflight, commit, push, ensure the draft PR exists, start babysitting CI. Usage: /ship <commit message>
argument-hint: <commit message>
allowed-tools: Bash(npm run preflight:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git status:*), Bash(git fetch:*)
---

Ship the current work, auto-mode flow (AGENTS.md Git & PR workflow):

1. Run the **/preflight** gate in full (script + semantic self-review). If
   anything fails: stop, fix, re-run — never skip a step to make it pass.
2. If clean: `git add -A`, commit with this message — `$ARGUMENTS` — and
   `git push -u origin <current-branch>`.
3. Ensure a **draft PR** exists for the branch (create it if not — GitHub
   MCP in remote sessions, `gh pr create --draft` locally), with the PR
   template filled: preflight summary in Testing, `## Deviations from plan`
   honest.
4. Subscribe to PR activity and babysit CI to green: diagnose and fix
   failures autonomously, re-preflight before each fix push (WA #12).
5. Report state to Scott. **Never merge** — the merge button is Scott's.
