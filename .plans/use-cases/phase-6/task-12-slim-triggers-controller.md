# Task: Slim TriggersController

**Plan**: Use Cases
**Phase**: 6
**Task Path**: phase-6/task-12-slim-triggers-controller
**Depends On**: phase-6/task-11-trigger-usecases
**JIRA**: N/A

## Objective

Replace business logic in `TriggersController` with delegation to the three trigger use cases. Update `resources-routes.js` to inject them.

## Context

After task-11, all three trigger use cases exist. `TriggersController` constructor changes to receive `{ createTrigger, updateTrigger, importFacebookCatalog }`. The `new Trigger() + validateSync + save` antipattern and direct `Trigger.updateOne` are removed.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/TriggersController.js` | modify | Slim to HTTP adapter |
| `src/app/routes/resources-routes.js` | modify | Wire the three trigger use cases |

## Implementation Steps

### Step 1: Slim TriggersController
Replace each method body with use case delegation. Remove `new Trigger()`, `validateSync`, `save`, and `Trigger.updateOne` references.

### Step 2: Update resources-routes.js
Instantiate the three trigger use cases and inject into `new TriggersController(...)`.

### Step 3: Update TriggersController.spec.js

## Testing

- [ ] `npx jest src/app/controllers/TriggersController.spec.js` passes
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] No antipattern code remains in `TriggersController`
- [ ] All three use cases wired in route file
- [ ] Controller spec updated and passing
- [ ] Changes committed to `plan/use-cases/phase-6/task-12-slim-triggers-controller` branch
- [ ] Status updated in `status.md`
