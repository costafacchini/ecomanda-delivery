# Task: Delete CartsController and its spec

**Plan**: Remove PDV Domain
**Phase**: 2
**Task Path**: phase-2/task-04-delete-carts-controller
**Depends On**: phase-1/task-01-remove-pdv-routes-v1
**JIRA**: N/A

## Objective

Delete `src/app/controllers/CartsController.js` and `CartsController.spec.js` from the codebase.

## Context

The routes for CartsController were removed in task-01. The file is now dead code. Deleting it also removes 9 controller methods (create, update, show, close, addItem, removeItem, send, getCart, getPayment, reset) and their specs. Verify no remaining imports exist before deleting.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/CartsController.js` | delete | |
| `src/app/controllers/CartsController.spec.js` | delete | |

## Implementation Steps

### Step 1: Grep for remaining imports
`grep -r "CartsController" src/` — must return no results (routes were cleaned in task-01).

### Step 2: Delete both files

### Step 3: Run tests

## Testing

- [ ] `npx jest` passes with no reference to CartsController
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `CartsController.js` and `CartsController.spec.js` deleted
- [ ] No remaining imports in codebase
- [ ] All tests pass
- [ ] Changes committed to `plan/remove-pdv/phase-2/task-04-delete-carts-controller` branch
- [ ] Status updated in `status.md`
