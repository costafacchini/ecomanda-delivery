# Task: Extract AuthenticateUser use case

**Plan**: Use Cases
**Phase**: 2
**Task Path**: phase-2/task-02-authenticate-user-usecase
**Depends On**: phase-1/task-01-scaffold-usecases-dir
**JIRA**: N/A

## Objective

Extract the authentication business logic from `LoginController.login` into a new `AuthenticateUser` use case class with a matching spec that runs without `mongoServer`.

## Context

`LoginController.login` currently finds a user by email, validates the password with bcrypt, and signs a JWT. The use case takes over all of that logic. `LoginController` becomes a thin HTTP adapter. `jwt` (or a token service wrapper) and `userRepository` are injected via constructor. The use case spec uses `UserRepositoryMemory` so no real DB is needed.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/auth/AuthenticateUser.js` | create | Use case class |
| `src/app/usecases/auth/AuthenticateUser.spec.js` | create | Spec without mongoServer |

## Implementation Steps

### Step 1: Read existing LoginController
Read `src/app/controllers/LoginController.js` to capture the exact logic to move.

### Step 2: Create AuthenticateUser
Constructor receives `{ userRepository, tokenService }` (or `jwt` directly — match whatever injection pattern is established in the DI plan). `execute({ email, password })` finds the user, compares password, signs and returns the token. Throws a descriptive error on invalid credentials.

### Step 3: Write spec
Use `UserRepositoryMemory` to pre-seed a user. Assert that valid credentials return a token and invalid credentials throw.

## Testing

- [ ] `npx jest src/app/usecases/auth/AuthenticateUser.spec.js` passes without mongoServer
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No product or API documentation changes expected for this extraction alone
- [ ] If the use case wiring reveals a reusable constructor/injection pattern for later controller extractions, capture it with `document-solution`
- [ ] If any KB files change, run `check-kb-index`

## Completion Criteria

- [ ] `src/app/usecases/auth/AuthenticateUser.js` exists
- [ ] Spec passes without `mongoServer`
- [ ] Changes committed to `plan/use-cases/phase-2/task-02-authenticate-user-usecase` branch
- [ ] Status updated in `status.md`
