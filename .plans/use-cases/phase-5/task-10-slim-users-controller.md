# Task: Slim UsersController

**Plan**: Use Cases
**Phase**: 5
**Task Path**: phase-5/task-10-slim-users-controller
**Depends On**: phase-5/task-09-user-usecases
**JIRA**: N/A

## Objective

Replace business logic in `UsersController` with delegation to `CreateUser` and `UpdateUser`. Update `resources-routes.js` to inject the two use cases.

## Context

The antipattern `new User() + validateSync + save` and direct `User.updateOne` are removed from the controller. Constructor receives `{ createUser, updateUser }`.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/UsersController.js` | modify | Slim to HTTP adapter |
| `src/app/routes/resources-routes.js` | modify | Wire CreateUser and UpdateUser |

## Implementation Steps

### Step 1: Slim UsersController
Replace `create` and `update` bodies with use case delegation. Remove all `new User()`, `validateSync`, `save`, and `User.updateOne` references.

### Step 2: Update resources-routes.js
Instantiate `CreateUser` and `UpdateUser` and inject into `new UsersController(...)`.

### Step 3: Update UsersController.spec.js
Mock the two use cases. Assert HTTP response behaviour.

## Testing

- [ ] `npx jest src/app/controllers/UsersController.spec.js` passes
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] No `new User()`, `validateSync`, `save`, or `User.updateOne` remains in `UsersController`
- [ ] Both use cases wired in route file
- [ ] Controller spec updated and passing
- [ ] Changes committed to `plan/use-cases/phase-5/task-10-slim-users-controller` branch
- [ ] Status updated in `status.md`
