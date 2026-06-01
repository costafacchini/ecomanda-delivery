# Task: Delete plugins/payments/ directory

**Plan**: Remove PDV Domain
**Phase**: 5
**Task Path**: phase-5/task-15-delete-payment-plugins
**Depends On**: phase-3/task-07-delete-pedidos10-services, phase-3/task-08-delete-pagarme-services, phase-3/task-09-delete-backgroundjob-payment-services, phase-3/task-10-delete-reset-carts-service, phase-3/task-11-delete-process-webhook-request-service
**JIRA**: N/A

## Objective

Delete the entire `src/app/plugins/payments/` directory including PagarMe plugin and all sub-files.

## Context

Files in scope:
- `plugins/payments/PagarMe.ts` (+ spec)
- `plugins/payments/PagarMe/Card.ts`, `Customer.ts`, `Payment.ts`, `Parser.ts`, `Recipient.ts` (+ specs)

All were consumed by PagarMe services (deleted in Phase 3) and `LicenseesController.sendToPagarMe` (deleted in Phase 1). Grep before deleting.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/payments/` | delete (entire directory) | 6 source + 6 spec files |

## Implementation Steps

### Step 1: Grep for remaining imports
`grep -r "plugins/payments" src/` — must return zero results.

### Step 2: Delete the entire `plugins/payments/` directory
### Step 3: Run tests

## Testing

- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `plugins/payments/` directory deleted
- [ ] No remaining imports
- [ ] Changes committed to `plan/remove-pdv/phase-5/task-15-delete-payment-plugins` branch
- [ ] Status updated in `status.md`
