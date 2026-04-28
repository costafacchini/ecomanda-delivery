# Task: Slim LoginController

**Plan**: Use Cases
**Phase**: 2
**Task Path**: phase-2/task-03-slim-login-controller
**Depends On**: phase-2/task-02-authenticate-user-usecase
**JIRA**: N/A

## Objective

Reduce `LoginController` to a thin HTTP adapter that delegates to `AuthenticateUser` and handles only the HTTP response. Update `login-route.js` to inject the use case.

## Context

After `AuthenticateUser` is extracted, `LoginController.login` should contain only: call `this.authenticateUser.execute(req.body)`, send 200 with the token, or catch and send 401/422. No bcrypt, no JWT signing, no user lookups remain in the controller. `login-route.js` is the composition root where `AuthenticateUser` is instantiated and injected.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/LoginController.js` | modify | Slim to HTTP adapter |
| `src/app/routes/login-route.js` | modify | Inject AuthenticateUser |

## Implementation Steps

### Step 1: Slim LoginController
Replace the body of `login()` with a delegation call to `this.authenticateUser.execute(req.body)`. Remove all business logic imports (bcrypt, jwt). Constructor receives `{ authenticateUser }`.

### Step 2: Update login-route.js
Instantiate `AuthenticateUser` with its dependencies (userRepository, tokenService) and pass it to `new LoginController({ authenticateUser })`.

### Step 3: Verify existing LoginController spec
Update `LoginController.spec.js` to mock `authenticateUser.execute` rather than real dependencies. Confirm all login spec cases pass.

## Testing

- [ ] `npx jest src/app/controllers/LoginController.spec.js` passes
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `LoginController.login` contains no business logic
- [ ] `login-route.js` wires `AuthenticateUser` into the controller
- [ ] All login controller specs pass
- [ ] Changes committed to `plan/use-cases/phase-2/task-03-slim-login-controller` branch
- [ ] Status updated in `status.md`
