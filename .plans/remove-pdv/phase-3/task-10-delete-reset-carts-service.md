# Task: Delete ResetCarts service

**Plan**: Remove PDV Domain
**Phase**: 3
**Task Path**: phase-3/task-10-delete-reset-carts-service
**Depends On**: phase-2/task-04-delete-carts-controller, phase-2/task-05-delete-orders-controller, phase-2/task-06-delete-integrations-controller
**JIRA**: N/A

## Objective

Delete `src/app/services/ResetCarts.js` and its spec.

## Context

`ResetCarts.js` warns/closes carts with an expired WhatsApp window. It depends on `Cart` model and cart-related repositories. The job that calls it is deleted in Phase 4.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/services/ResetCarts.js` | delete | + spec |

## Implementation Steps

### Step 1: Grep for remaining imports
### Step 2: Delete service file and spec
### Step 3: Run tests

## Testing

- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `ResetCarts.js` and spec deleted
- [ ] No remaining imports
- [ ] Changes committed to `plan/remove-pdv/phase-3/task-10-delete-reset-carts-service` branch
- [ ] Status updated in `status.md`
