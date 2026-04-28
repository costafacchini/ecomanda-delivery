# Task: Delete ProcessWebhookRequest service

**Plan**: Remove PDV Domain
**Phase**: 3
**Task Path**: phase-3/task-11-delete-process-webhook-request-service
**Depends On**: phase-2/task-04-delete-carts-controller, phase-2/task-05-delete-orders-controller, phase-2/task-06-delete-integrations-controller
**JIRA**: N/A

## Objective

Delete `src/app/services/ProcessWebhookRequest.js` and its spec.

## Context

`ProcessWebhookRequest.js` dispatches incoming webhooks with Pedidos10-specific routing logic. It was only called from `IntegrationsController` (now deleted). Before deleting, confirm via grep that no other callers exist.

> Risk: if this service was somehow wired to a non-Pedidos10 webhook path, removing it could silently drop webhooks. Grep for all usages before proceeding.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/services/ProcessWebhookRequest.js` | delete | + spec |

## Implementation Steps

### Step 1: Grep for all usages
`grep -r "ProcessWebhookRequest" src/` — must return zero results after IntegrationsController was deleted.

### Step 2: Delete service file and spec
### Step 3: Run tests

## Testing

- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `ProcessWebhookRequest.js` and spec deleted
- [ ] No remaining imports
- [ ] Changes committed to `plan/remove-pdv/phase-3/task-11-delete-process-webhook-request-service` branch
- [ ] Status updated in `status.md`
