# Task: Delete ProcessPagarmeOrderPaid and SendContactToPagarMe services

**Plan**: Remove PDV Domain
**Phase**: 3
**Task Path**: phase-3/task-08-delete-pagarme-services
**Depends On**: phase-2/task-04-delete-carts-controller, phase-2/task-05-delete-orders-controller, phase-2/task-06-delete-integrations-controller
**JIRA**: N/A

## Objective

Delete `services/ProcessPagarmeOrderPaid.js` and `services/SendContactToPagarMe.js` plus their specs.

## Context

- `ProcessPagarmeOrderPaid.js` — handles PagarMe paid webhook event
- `SendContactToPagarMe.js` — registers a contact as a PagarMe customer

Both were consumed by jobs that are being deleted in Phase 4. Note: `ContactsController.create` and `.update` call `SendContactToPagarMe` indirectly via a job queue — confirm the job enqueue calls are also removed in Phase 4.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/services/ProcessPagarmeOrderPaid.js` | delete | + spec |
| `src/app/services/SendContactToPagarMe.js` | delete | + spec |

## Implementation Steps

### Step 1: Grep for remaining imports
### Step 2: Delete both service files and specs
### Step 3: Run tests

## Testing

- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] Both service files and specs deleted
- [ ] No remaining imports
- [ ] Changes committed to `plan/remove-pdv/phase-3/task-08-delete-pagarme-services` branch
- [ ] Status updated in `status.md`
