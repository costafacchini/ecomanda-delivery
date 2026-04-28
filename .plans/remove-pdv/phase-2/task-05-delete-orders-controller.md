# Task: Delete OrdersController and its spec

**Plan**: Remove PDV Domain
**Phase**: 2
**Task Path**: phase-2/task-05-delete-orders-controller
**Depends On**: phase-1/task-01-remove-pdv-routes-v1
**JIRA**: N/A

## Objective

Delete `src/app/controllers/OrdersController.js` and `OrdersController.spec.js`.

## Context

The `/v1/orders/*` routes were removed in task-01. `OrdersController` handled Pedidos10 webhook ingestion (`create` and `changeStatus`). Verify no remaining imports before deleting.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/OrdersController.js` | delete | |
| `src/app/controllers/OrdersController.spec.js` | delete | |

## Implementation Steps

### Step 1: Grep for remaining imports
`grep -r "OrdersController" src/` — must return no results.

### Step 2: Delete both files
### Step 3: Run tests

## Testing

- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `OrdersController.js` and spec deleted
- [ ] No remaining imports
- [ ] Changes committed to `plan/remove-pdv/phase-2/task-05-delete-orders-controller` branch
- [ ] Status updated in `status.md`
