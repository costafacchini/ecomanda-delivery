# Task: Remove parseCart from ParseTriggerText helper

**Plan**: Remove PDV Domain
**Phase**: 8
**Task Path**: phase-8/task-23-remove-parsecart-from-parse-trigger-text
**Depends On**: phase-8/task-22-delete-fractional-products-helper
**JIRA**: N/A

## Objective

Remove the `parseCart` function from `src/app/helpers/ParseTriggerText.js`. Update `ParseTriggerText.spec.js` to remove tests for `parseCart`. Verify no remaining callers exist.

## Context

`ParseTriggerText.js` is a shared helper that parses trigger text tokens. The `parseCart` function within it was PDV-specific, converting trigger tokens into cart item structures. The rest of the helper (non-cart parsing) is still in use.

> Risk: Only remove the `parseCart` function and its associated tests. Do not touch other functions in this file. Run `grep -r "parseCart" src/` to confirm no remaining callers after removal.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Read `ParseTriggerText.js` in full before editing
- [ ] Run `grep -r "parseCart" src/` to identify all callers
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/helpers/ParseTriggerText.js` | modify | Remove `parseCart` function only |
| `src/app/helpers/ParseTriggerText.spec.js` | modify | Remove test cases for `parseCart` |

## Implementation Steps

### Step 1: Read ParseTriggerText.js
Identify the `parseCart` function boundaries and any internal helpers it uses exclusively.

### Step 2: Grep for callers
Run `grep -r "parseCart" src/`. All callers should already be deleted PDV code. If any non-PDV callers are found, do not proceed — flag for review.

### Step 3: Remove parseCart from ParseTriggerText.js
Delete the `parseCart` function and any internal helpers used solely by it. Remove any `require`/`import` statements that were only needed by `parseCart` (e.g., `FractionalProducts`).

### Step 4: Update ParseTriggerText.spec.js
Remove test cases that reference `parseCart`. Keep all other test cases intact.

### Step 5: Run tests

## Testing

- [ ] `npx jest src/app/helpers/ParseTriggerText.spec.js` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `parseCart` function removed from `ParseTriggerText.js`
- [ ] Associated spec tests removed
- [ ] No remaining `parseCart` callers confirmed by grep
- [ ] All other `ParseTriggerText` tests still pass
- [ ] Changes committed to `plan/remove-pdv/phase-8/task-23-remove-parsecart-from-parse-trigger-text` branch
- [ ] Status updated in `status.md`
