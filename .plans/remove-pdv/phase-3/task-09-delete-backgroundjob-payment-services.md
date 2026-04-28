# Task: Delete all 5 ProcessBackgroundjob payment services

**Plan**: Remove PDV Domain
**Phase**: 3
**Task Path**: phase-3/task-09-delete-backgroundjob-payment-services
**Depends On**: phase-2/task-04-delete-carts-controller, phase-2/task-05-delete-orders-controller, phase-2/task-06-delete-integrations-controller
**JIRA**: N/A

## Objective

Delete the five `ProcessBackgroundjob*.js` payment-related service files and their specs.

## Context

Files to delete:
- `services/ProcessBackgroundjobCancelOrder.js`
- `services/ProcessBackgroundjobChargeCreditCard.js`
- `services/ProcessBackgroundjobGetCreditCard.js`
- `services/ProcessBackgroundjobGetPix.js`
- `services/ProcessBackgroundjobInviteCreditCard.js`

All five are consumed only by PDV background job files (being deleted in Phase 4).

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/services/ProcessBackgroundjob{CancelOrder,ChargeCreditCard,GetCreditCard,GetPix,InviteCreditCard}.js` | delete | + specs |

## Implementation Steps

### Step 1: Grep for remaining imports of each
### Step 2: Delete all 5 service files and their specs
### Step 3: Run tests

## Testing

- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All 5 service files and specs deleted
- [ ] No remaining imports
- [ ] Changes committed to `plan/remove-pdv/phase-3/task-09-delete-backgroundjob-payment-services` branch
- [ ] Status updated in `status.md`
