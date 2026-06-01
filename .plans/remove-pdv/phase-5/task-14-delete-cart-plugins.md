# Task: Delete plugins/carts/ directory

**Plan**: Remove PDV Domain
**Phase**: 5
**Task Path**: phase-5/task-14-delete-cart-plugins
**Depends On**: phase-3/task-07-delete-pedidos10-services, phase-3/task-08-delete-pagarme-services, phase-3/task-09-delete-backgroundjob-payment-services, phase-3/task-10-delete-reset-carts-service, phase-3/task-11-delete-process-webhook-request-service
**JIRA**: N/A

## Objective

Delete the entire `src/app/plugins/carts/` directory including all cart plugin files, adapter files, and their specs.

## Context

Files in scope:
- `plugins/carts/Alloy.ts`, `Go2go.ts`, `Go2goV2.ts`, `factory.ts` (+ specs)
- `plugins/carts/adapters/Alloy.ts`, `Default.ts`, `Gallabox.ts`, `factory.ts` (+ specs)

These were consumed by `ResetCarts` service (deleted) and `CartsController` (deleted). Grep before deleting.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/carts/` | delete (entire directory) | 8 source + 8 spec files |

## Implementation Steps

### Step 1: Grep for remaining imports
`grep -r "plugins/carts" src/` — must return zero results.

### Step 2: Delete the entire `plugins/carts/` directory
### Step 3: Run tests

## Testing

- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `plugins/carts/` directory deleted
- [ ] No remaining imports
- [ ] Changes committed to `plan/remove-pdv/phase-5/task-14-delete-cart-plugins` branch
- [ ] Status updated in `status.md`
