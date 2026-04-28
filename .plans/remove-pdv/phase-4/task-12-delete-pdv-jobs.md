# Task: Delete 12 PDV job files

**Plan**: Remove PDV Domain
**Phase**: 4
**Task Path**: phase-4/task-12-delete-pdv-jobs
**Depends On**: phase-3/task-07-delete-pedidos10-services, phase-3/task-08-delete-pagarme-services, phase-3/task-09-delete-backgroundjob-payment-services, phase-3/task-10-delete-reset-carts-service, phase-3/task-11-delete-process-webhook-request-service
**JIRA**: N/A

## Objective

Delete all 12 PDV-specific job files from `src/app/jobs/`.

## Context

Files to delete:
`jobs/Integration10SendOrder.js`, `jobs/Pedidos10ChangeOrderStatus.js`, `jobs/Pedidos10Webhook.js`,
`jobs/ProcessBackgroundjob.js`, `jobs/ProcessBackgroundjobCancelOrder.js`,
`jobs/ProcessBackgroundjobChargeCreditCard.js`, `jobs/ProcessBackgroundjobGetCreditCard.js`,
`jobs/ProcessBackgroundjobGetPix.js`, `jobs/ProcessBackgroundjobInviteCreditCard.js`,
`jobs/ProcessPagarmeOrderPaid.js`, `jobs/ResetCarts.js`, `jobs/SendContactToPagarMe.js`

Their service dependencies were deleted in Phase 3. Grep for remaining imports before deleting.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/jobs/Integration10SendOrder.js` | delete | |
| `src/app/jobs/Pedidos10ChangeOrderStatus.js` | delete | |
| `src/app/jobs/Pedidos10Webhook.js` | delete | |
| `src/app/jobs/ProcessBackgroundjob.js` | delete | |
| `src/app/jobs/ProcessBackgroundjob{CancelOrder,ChargeCreditCard,GetCreditCard,GetPix,InviteCreditCard}.js` | delete | |
| `src/app/jobs/ProcessPagarmeOrderPaid.js` | delete | |
| `src/app/jobs/ResetCarts.js` | delete | |
| `src/app/jobs/SendContactToPagarMe.js` | delete | |

## Implementation Steps

### Step 1: Grep for imports of each job file
### Step 2: Delete all 12 files
### Step 3: Run tests

## Testing

- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All 12 PDV job files deleted
- [ ] No remaining imports
- [ ] Changes committed to `plan/remove-pdv/phase-4/task-12-delete-pdv-jobs` branch
- [ ] Status updated in `status.md`
