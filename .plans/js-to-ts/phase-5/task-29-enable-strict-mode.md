# Task: Enable strict: true in both tsconfigs

**Plan**: JS to TypeScript Migration
**Phase**: 5
**Task Path**: phase-5/task-29-enable-strict-mode
**Depends On**: phase-5/task-27-enable-noimplicitany-backend, phase-5/task-28-enable-noimplicitany-client
**JIRA**: N/A

## Objective

Enable `strict: true` in both `tsconfig.json` (root/backend) and `client/tsconfig.json`, fixing all errors surfaced by `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, and related flags.

## Context

`strict: true` implies `noImplicitAny` (already enabled) plus `strictNullChecks` and other flags. The primary new errors will be around possibly-undefined values. Fix by adding null checks, optional chaining, or non-null assertions where the developer has verified safety. Do not suppress with `!` without a comment.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `tsconfig.json` | modify | Set `strict: true` |
| `client/tsconfig.json` | modify | Set `strict: true` |
| `src/**/*.ts` | modify | Fix strictNullChecks errors |
| `client/src/**/*.tsx` | modify | Fix strictNullChecks errors |

## Implementation Steps

### Step 1: Enable strict in root tsconfig, fix backend errors
### Step 2: Enable strict in client tsconfig, fix client errors
### Step 3: Full verification: `yarn typecheck`, `npx jest`, `vitest run`, `vite build`

## Testing

- [ ] `yarn typecheck` passes with `strict: true`
- [ ] `npx jest` passes
- [ ] `vitest run` passes
- [ ] `vite build` succeeds
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `strict: true` in both tsconfigs
- [ ] Zero TS errors in both backend and client
- [ ] All test suites pass
- [ ] Changes committed to `plan/js-to-ts/phase-5/task-29-enable-strict-mode` branch
- [ ] Status updated in `status.md`
