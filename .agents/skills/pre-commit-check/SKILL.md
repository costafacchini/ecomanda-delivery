---
name: pre-commit-check
description: Validates code quality and conventions before committing
---

# Pre-Commit Check

## Context Required
LOW-CONTEXT: Staged files and AGENTS.md test/lint commands

## Setup

1. Load `.agents/memory/project-profile.md` (always)
2. Load `.agents/memory/decisions.md` if this skill touches architecture
3. Check `docs/kb/README.md`; read any matching doc before grepping code
4. Explore codebase patterns only after steps 1–3

Skip steps not relevant to this skill's scope.

## Triggers

### Automatic — fires BEFORE the git operation, not after

Trigger when user says ANY of:
- "commit", "git commit", "create commit"
- "stage", "git add", "add these files", "add to staging"
- "prepare for commit", "ready to commit"
- "create a PR", "open a pull request"
- Any variation of committing or staging code

### Manual
- `/pre-commit-check`
- "run pre-commit-check"
- "validate my changes"
- "check before commit"

---

Run automatically before ANY commit, staging, or push operation.

## Steps

1. **Check status**: `git status` and `git diff --stat`
2. **Run linter** (if configured in AGENTS.md) — fix auto-fixable issues
3. **Run tests** (if configured in AGENTS.md) — report failures
4. **Convention scan**:
   - No hardcoded strings that should be constants
   - No TODO/FIXME without context
   - No debug statements (console.log, puts, print, debugger)
   - No secrets or credentials in code
   - No files over 500 lines (flag for review)
5. **KB check**: If docs/kb/ files modified, run `check-kb-index`
6. **Report**: Group findings as BLOCK / WARN / INFO

```
## Pre-Commit Check

### BLOCK (must fix)
- [ ] ...

### WARN (review)
- [ ] ...

### INFO
- ...

Status: PASS / FAIL
```
