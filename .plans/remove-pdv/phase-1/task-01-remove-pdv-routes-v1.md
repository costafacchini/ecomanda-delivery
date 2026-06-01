# Task: Remove PDV routes from v1-routes.ts

**Plan**: Remove PDV Domain
**Phase**: 1
**Task Path**: phase-1/task-01-remove-pdv-routes-v1
**Depends On**: None
**JIRA**: N/A

## Objective

Remove all `/v1/carts/*` (10 routes), `/v1/orders/*` (2 routes), and `/v1/integrations` (1 route) from `src/app/routes/v1/v1-routes.ts`, along with their controller imports.

## Context

This is the safest first step: removing routes makes the API surface smaller and gives a clear traffic signal. After merging, monitor that zero requests hit the removed paths before proceeding to Phase 2. The controller files themselves are NOT deleted here — only their registrations in the route file and their imports.

> Confirm with stakeholders that no production traffic is hitting these routes before merging.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/routes/v1/v1-routes.ts` | modify | Remove PDV route registrations and controller imports |

## Implementation Steps

### Step 1: Read v1-routes.ts
Identify all carts, orders, and integrations route registrations and their corresponding controller imports.

### Step 2: Remove route registrations
Delete all `router.get/post/put/patch/delete` calls for `/carts`, `/orders`, and `/integrations` paths.

### Step 3: Remove controller imports
Delete the `import`/`require` lines for `CartsController`, `OrdersController`, `IntegrationsController`.

### Step 4: Run tests
`npx jest` — existing tests must still pass (controller files still exist, just not imported in routes).

## Testing

- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `v1-routes.ts` has no carts, orders, or integrations route registrations
- [ ] `v1-routes.ts` has no imports of the three PDV controllers
- [ ] All tests pass
- [ ] Changes committed to `plan/remove-pdv/phase-1/task-01-remove-pdv-routes-v1` branch
- [ ] Status updated in `status.md`
