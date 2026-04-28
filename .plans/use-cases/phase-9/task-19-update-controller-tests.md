# Task: Update controller specs to mock use cases

**Plan**: Use Cases
**Phase**: 9
**Task Path**: phase-9/task-19-update-controller-tests
**Depends On**: phase-9/task-18-update-composition-root
**JIRA**: N/A

## Objective

Audit all controller spec files to ensure they test only HTTP response behaviour, with all use cases mocked — no real repositories, no real plugins, no `mongoServer` in controller tests.

## Context

Individual slim tasks updated controller specs as they went. This task does a final sweep to ensure every controller spec follows the pattern: inject a mocked use case, call the controller method, assert the HTTP status and response body. Any spec that still uses `mongoServer` or instantiates real repositories should be refactored.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/*.spec.js` | modify | Audit and update each spec |

## Implementation Steps

### Step 1: List all controller specs
Identify every `*.spec.js` under `src/app/controllers/`.

### Step 2: Audit each spec
For each: does it use `mongoServer`? Does it import real repositories or plugins? If yes, refactor to use mocked use cases.

### Step 3: Run controller specs in isolation
`npx jest src/app/controllers/` — all must pass without `mongoServer`.

### Step 4: Run full suite
`npx jest` — all 2611 tests must pass.

## Testing

- [ ] `npx jest src/app/controllers/` passes with no mongoServer usage
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All controller specs assert HTTP behaviour only and use mocked use cases
- [ ] No `mongoServer` in any controller spec
- [ ] Full test suite passes
- [ ] Changes committed to `plan/use-cases/phase-9/task-19-update-controller-tests` branch
- [ ] Status updated in `status.md`
