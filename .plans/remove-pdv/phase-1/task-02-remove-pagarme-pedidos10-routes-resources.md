# Task: Remove PagarMe and Pedidos10 routes from resources-routes.ts

**Plan**: Remove PDV Domain
**Phase**: 1
**Task Path**: phase-1/task-02-remove-pagarme-pedidos10-routes-resources
**Depends On**: None
**JIRA**: N/A

## Objective

Remove `POST /licensees/:id/integration/pagarme` and `POST /licensees/:id/sign-order-webhook` from `src/app/routes/resources-routes.ts`.

## Context

These two routes expose PagarMe recipient creation and Pedidos10 order webhook signing on the licensee resource. After removal, these operations can no longer be triggered via the API. Confirm with stakeholders this is intentional before merging.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/routes/resources-routes.ts` | modify | Remove the two PDV licensee routes |

## Implementation Steps

### Step 1: Read resources-routes.ts
Locate the two route registrations.

### Step 2: Remove both route registrations
Delete the `router.post` calls for `integration/pagarme` and `sign-order-webhook`.

### Step 3: Run tests

## Testing

- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `resources-routes.ts` has no pagarme or sign-order-webhook route for licensees
- [ ] All tests pass
- [ ] Changes committed to `plan/remove-pdv/phase-1/task-02-remove-pagarme-pedidos10-routes-resources` branch
- [ ] Status updated in `status.md`
