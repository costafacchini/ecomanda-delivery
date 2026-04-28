# Task: Delete BillingQuery and IntegrationlogsQuery

**Plan**: Remove PDV Domain
**Phase**: 6
**Task Path**: phase-6/task-19-delete-pdv-queries
**Depends On**: phase-6/task-18-delete-pdv-models-repositories
**JIRA**: N/A

## Objective

Delete `src/app/queries/BillingQuery.js` and `src/app/queries/IntegrationlogsQuery.js` plus their specs.

## Context

Both query files depend on models deleted in task-18. `BillingQuery` operates on the `Cart`/`Order` collections. `IntegrationlogsQuery` operates on `Integrationlog`. After model deletion these queries have no valid target. Grep for remaining callers before deleting.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/queries/BillingQuery.js` | delete | + spec |
| `src/app/queries/IntegrationlogsQuery.js` | delete | + spec |

## Implementation Steps

### Step 1: Grep for remaining imports
### Step 2: Delete both query files and specs
### Step 3: Run tests

## Testing

- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] Both query files and specs deleted
- [ ] No remaining imports
- [ ] Changes committed to `plan/remove-pdv/phase-6/task-19-delete-pdv-queries` branch
- [ ] Status updated in `status.md`
