# Task: Extract CreateUser and UpdateUser use cases

**Plan**: Use Cases
**Phase**: 5
**Task Path**: phase-5/task-09-user-usecases
**Depends On**: phase-1/task-01-scaffold-usecases-dir
**JIRA**: N/A

## Objective

Extract `CreateUser` and `UpdateUser` use cases from `UsersController`, eliminating the `new User() + validateSync + save` antipattern in the controller.

## Context

`UsersController.create` currently does `new User(fields); user.validateSync(); user.save()` — bypassing the repository abstraction. `CreateUser` use case moves this into `userRepository.create(fields)`. Similarly `UpdateUser` replaces direct `User.updateOne` calls with `userRepository.update(id, fields)`. Tests use `UserRepositoryMemory`.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/users/CreateUser.js` | create | Uses userRepository.create |
| `src/app/usecases/users/CreateUser.spec.js` | create | |
| `src/app/usecases/users/UpdateUser.js` | create | Uses userRepository.update |
| `src/app/usecases/users/UpdateUser.spec.js` | create | |

## Implementation Steps

### Step 1: Read UsersController
Read `src/app/controllers/UsersController.js` to capture the antipattern and field list.

### Step 2: Create CreateUser and UpdateUser
Each receives `{ userRepository }`. `CreateUser.execute(fields)` calls `this.userRepository.create(fields)`. `UpdateUser.execute(id, fields)` calls `this.userRepository.update(id, fields)`.

### Step 3: Write specs
Use `UserRepositoryMemory`. Assert the returned record has the expected fields.

## Testing

- [ ] `npx jest src/app/usecases/users/` passes without mongoServer
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] Both use case files and specs created and passing
- [ ] Changes committed to `plan/use-cases/phase-5/task-09-user-usecases` branch
- [ ] Status updated in `status.md`
