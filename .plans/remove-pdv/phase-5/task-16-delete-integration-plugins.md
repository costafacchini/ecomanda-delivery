# Task: Delete plugins/integrations/ directory

**Plan**: Remove PDV Domain
**Phase**: 5
**Task Path**: phase-5/task-16-delete-integration-plugins
**Depends On**: phase-3/task-07-delete-pedidos10-services, phase-3/task-08-delete-pagarme-services, phase-3/task-09-delete-backgroundjob-payment-services, phase-3/task-10-delete-reset-carts-service, phase-3/task-11-delete-process-webhook-request-service
**JIRA**: N/A

## Objective

Delete the entire `src/app/plugins/integrations/` directory including Pedidos10 integrator plugin and all sub-files.

## Context

Files in scope:
- `plugins/integrations/IntegratorBase.ts`, `Pedidos10.ts`, `factory.ts` (+ specs)
- `plugins/integrations/Pedidos10/Order.ts`, `Parser.ts` (+ specs)

All were consumed by Pedidos10 services (deleted in Phase 3). Grep before deleting.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/integrations/` | delete (entire directory) | 5 source + 4 spec files |

## Implementation Steps

### Step 1: Grep for remaining imports
`grep -r "plugins/integrations" src/` — must return zero results.

### Step 2: Delete the entire `plugins/integrations/` directory
### Step 3: Run tests

## Testing

- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `plugins/integrations/` directory deleted
- [ ] No remaining imports
- [ ] Changes committed to `plan/remove-pdv/phase-5/task-16-delete-integration-plugins` branch
- [ ] Status updated in `status.md`
