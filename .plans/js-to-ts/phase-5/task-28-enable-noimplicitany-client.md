# Task: Enable noImplicitAny on client tsconfig

**Plan**: JS to TypeScript Migration
**Phase**: 5
**Task Path**: phase-5/task-28-enable-noimplicitany-client
**Depends On**: phase-4/task-26-migrate-client-root
**JIRA**: N/A

## Objective

Set `noImplicitAny: true` in `client/tsconfig.json` and fix all resulting TypeScript errors in the client source tree.

## Context

Same approach as task-27 but for the client. Fix prop types, hook return types, event handler parameters, and API response shapes.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/tsconfig.json` | modify | Set `noImplicitAny: true` |
| `client/src/**/*.tsx` | modify | Fix errors surfaced |

## Implementation Steps

### Step 1: Enable noImplicitAny in client tsconfig
### Step 2: Run vitest run and collect errors
### Step 3: Fix errors layer by layer (services → contexts → components → pages → root)
### Step 4: vitest run and vite build must pass

## Testing

- [ ] `vitest run` passes
- [ ] `vite build` succeeds
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `noImplicitAny: true` in client tsconfig
- [ ] Zero TS errors in client
- [ ] `vitest run` and `vite build` pass
- [ ] Changes committed to `plan/js-to-ts/phase-5/task-28-enable-noimplicitany-client` branch
- [ ] Status updated in `status.md`
