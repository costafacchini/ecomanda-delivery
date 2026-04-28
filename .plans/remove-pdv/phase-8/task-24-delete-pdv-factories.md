# Task: Delete PDV test factories

**Plan**: Remove PDV Domain
**Phase**: 8
**Task Path**: phase-8/task-24-delete-pdv-factories
**Depends On**: phase-8/task-23-remove-parsecart-from-parse-trigger-text
**JIRA**: N/A

## Objective

Delete the five PDV-specific test factory files: `src/app/factories/cart.js`, `src/app/factories/order.js`, `src/app/factories/product.js`, `src/app/factories/integrationlog.js`, `src/app/factories/backgroundjob.js`. These factories backed models that have already been deleted.

## Context

Test factories are only used within test files. With the PDV models and their spec files already deleted in earlier phases, these factories are unreferenced dead code. Deleting them removes the last test-layer artefacts of the PDV domain.

> Risk: Run `grep -r "factories/cart\|factories/order\|factories/product\|factories/integrationlog\|factories/backgroundjob" src/` to confirm no test file still imports any of these factories.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Run grep to confirm no test files import these factories
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/factories/cart.js` | delete | PDV factory — model deleted |
| `src/app/factories/order.js` | delete | PDV factory — model deleted |
| `src/app/factories/product.js` | delete | PDV factory — model deleted |
| `src/app/factories/integrationlog.js` | delete | PDV factory — model deleted |
| `src/app/factories/backgroundjob.js` | delete | PDV factory — model deleted |

## Implementation Steps

### Step 1: Grep for remaining imports
Run `grep -r "factories/cart\|factories/order\|factories/product\|factories/integrationlog\|factories/backgroundjob" src/`. If any test file still imports a factory, remove that import first (or confirm the importing spec was already deleted).

### Step 2: Delete the 5 factory files

### Step 3: Run tests

## Testing

- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All 5 PDV factory files deleted
- [ ] No remaining imports confirmed by grep
- [ ] All tests pass
- [ ] Changes committed to `plan/remove-pdv/phase-8/task-24-delete-pdv-factories` branch
- [ ] Status updated in `status.md`
