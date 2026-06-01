# Task: Delete Pedidos10Webhook, Pedidos10ChangeOrderStatus, IntegrationSendOrder services

**Plan**: Remove PDV Domain
**Phase**: 3
**Task Path**: phase-3/task-07-delete-pedidos10-services
**Depends On**: phase-2/task-04-delete-carts-controller, phase-2/task-05-delete-orders-controller, phase-2/task-06-delete-integrations-controller
**JIRA**: N/A

## Objective

Delete the three Pedidos10-related service files and their specs.

## Context

- `services/Pedidos10Webhook.ts` — processes incoming Pedidos10 webhook
- `services/Pedidos10ChangeOrderStatus.ts` — pushes order status change to Pedidos10
- `services/IntegrationSendOrder.ts` — sends order to Pedidos10

All three were consumed by jobs and controllers that are now deleted. Grep for remaining imports before deleting.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/services/Pedidos10Webhook.ts` | delete | + spec |
| `src/app/services/Pedidos10ChangeOrderStatus.ts` | delete | + spec |
| `src/app/services/IntegrationSendOrder.ts` | delete | + spec |

## Implementation Steps

### Step 1: Grep for remaining imports of each file
### Step 2: Delete source and spec files for each service
### Step 3: Run tests

## Testing

- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All three service files and specs deleted
- [ ] No remaining imports
- [ ] Changes committed to `plan/remove-pdv/phase-3/task-07-delete-pedidos10-services` branch
- [ ] Status updated in `status.md`
