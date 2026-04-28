# Task: Delete plugins/importers/facebook_catalog/

**Plan**: Remove PDV Domain
**Phase**: 5
**Task Path**: phase-5/task-17-delete-facebook-catalog-importer
**Depends On**: phase-3/task-07-delete-pedidos10-services, phase-3/task-08-delete-pagarme-services, phase-3/task-09-delete-backgroundjob-payment-services, phase-3/task-10-delete-reset-carts-service, phase-3/task-11-delete-process-webhook-request-service
**JIRA**: N/A

## Objective

Delete `src/app/plugins/importers/facebook_catalog/` directory (Facebook product catalog importer and its spec).

## Context

The Facebook catalog importer imports product catalog data into the `Product` model (which is being deleted in Phase 6). It was called from `TriggersController.importation`. If `ImportFacebookCatalog` use case was created in the use-cases plan, it also needs to be removed — but the use-cases plan is independent. Grep for all callers before deleting.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/importers/facebook_catalog/` | delete (entire directory) | |

## Implementation Steps

### Step 1: Grep for all callers
`grep -r "facebook_catalog" src/` — note any callers. If `TriggersController` still imports it, that must be cleaned first.

### Step 2: Delete the directory
### Step 3: Run tests

## Testing

- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `plugins/importers/facebook_catalog/` deleted
- [ ] No remaining imports
- [ ] Changes committed to `plan/remove-pdv/phase-5/task-17-delete-facebook-catalog-importer` branch
- [ ] Status updated in `status.md`
