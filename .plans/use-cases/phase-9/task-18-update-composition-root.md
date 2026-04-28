# Task: Update route files to wire use cases into controllers

**Plan**: Use Cases
**Phase**: 9
**Task Path**: phase-9/task-18-update-composition-root
**Depends On**: phase-2/task-03-slim-login-controller, phase-3/task-06-slim-licensees-controller, phase-4/task-08-slim-contacts-controller, phase-5/task-10-slim-users-controller, phase-6/task-12-slim-triggers-controller, phase-7/task-15-slim-orders-backgroundjobs-controllers
**JIRA**: N/A

## Objective

Do a final pass over all route files to ensure every use case is properly instantiated and injected, and that no controller still receives direct repository or plugin dependencies that belong in a use case.

## Context

Individual slim tasks each updated their slice of the route files. This task verifies the full picture: `resources-routes.js`, `login-route.js`, and `v1-routes.js` should each read as clean composition roots where repositories and plugins are instantiated once, use cases are constructed with those dependencies, and controllers receive only use cases.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/routes/resources-routes.js` | modify | Final wiring audit |
| `src/app/routes/login-route.js` | modify | Final wiring audit |
| `src/app/routes/v1/v1-routes.js` | modify | Final wiring audit |

## Implementation Steps

### Step 1: Audit each route file
Read each file and check: all controller constructors receive only use cases (no repositories, no plugins directly). All use cases are instantiated with their correct dependencies.

### Step 2: Fix any gaps
Correct any controller that still directly receives a repository or plugin.

### Step 3: Run full test suite
`npx jest` — all 2611 tests must pass.

## Testing

- [ ] `npx jest` passes (full suite)
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All three route files are clean composition roots
- [ ] No controller directly holds a repository or plugin dependency
- [ ] All tests pass
- [ ] Changes committed to `plan/use-cases/phase-9/task-18-update-composition-root` branch
- [ ] Status updated in `status.md`
