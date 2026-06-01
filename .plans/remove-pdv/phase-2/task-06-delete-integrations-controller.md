# Task: Delete IntegrationsController and its spec

**Plan**: Remove PDV Domain
**Phase**: 2
**Task Path**: phase-2/task-06-delete-integrations-controller
**Depends On**: phase-1/task-01-remove-pdv-routes-v1
**JIRA**: N/A

## Objective

Delete `src/app/controllers/IntegrationsController.ts` and `IntegrationsController.spec.ts`.

## Context

The `/v1/integrations` route was removed in task-01. `IntegrationsController` handled generic webhook ingestion (Pedidos10-specific routing via `ProcessWebhookRequest`). Verify no remaining imports before deleting.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/IntegrationsController.ts` | delete | |
| `src/app/controllers/IntegrationsController.spec.ts` | delete | |

## Implementation Steps

### Step 1: Grep for remaining imports
### Step 2: Delete both files
### Step 3: Run tests

## Testing

- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `IntegrationsController.ts` and spec deleted
- [ ] No remaining imports
- [ ] Changes committed to `plan/remove-pdv/phase-2/task-06-delete-integrations-controller` branch
- [ ] Status updated in `status.md`
