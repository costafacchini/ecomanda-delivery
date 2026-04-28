# Task: Slim OrdersController and BackgroundjobsController

**Plan**: Use Cases
**Phase**: 7
**Task Path**: phase-7/task-15-slim-orders-backgroundjobs-controllers
**Depends On**: phase-7/task-13-order-usecases, phase-7/task-14-backgroundjob-usecases
**JIRA**: N/A

## Objective

Replace business logic in `OrdersController` and `BackgroundjobsController` with delegation to their respective use cases. Update route files to inject the use cases.

## Context

`OrdersController` delegates to `ReceivePedidos10Order` and `ChangePedidos10OrderStatus`. `BackgroundjobsController` delegates to `ScheduleBackgroundjob`. Both controllers are updated in this single task since they share the same phase and dependency set.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/OrdersController.js` | modify | Slim to HTTP adapter |
| `src/app/controllers/BackgroundjobsController.js` | modify | Slim to HTTP adapter |
| `src/app/routes/v1/v1-routes.js` | modify | Wire order and backgroundjob use cases |

## Implementation Steps

### Step 1: Slim OrdersController
Constructor receives `{ receivePedidos10Order, changePedidos10OrderStatus }`. Replace method bodies with use case delegation.

### Step 2: Slim BackgroundjobsController
Constructor receives `{ scheduleBackgroundjob }`. Replace `create` body with delegation. Remove antipattern code.

### Step 3: Update v1-routes.js
Instantiate the three use cases and inject into their controllers.

### Step 4: Update controller specs for both controllers

## Testing

- [ ] `npx jest src/app/controllers/OrdersController.spec.js src/app/controllers/BackgroundjobsController.spec.js` passes
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] No business logic in either controller
- [ ] Use cases wired in route file
- [ ] Both controller specs updated and passing
- [ ] Changes committed to `plan/use-cases/phase-7/task-15-slim-orders-backgroundjobs-controllers` branch
- [ ] Status updated in `status.md`
