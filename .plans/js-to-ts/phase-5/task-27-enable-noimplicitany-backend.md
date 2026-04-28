# Task: Enable noImplicitAny on backend tsconfig

**Plan**: JS to TypeScript Migration
**Phase**: 5
**Task Path**: phase-5/task-27-enable-noimplicitany-backend
**Depends On**: phase-3/task-20-migrate-routes-websockets-entry
**JIRA**: N/A

## Objective

Set `noImplicitAny: true` in the root `tsconfig.json` and fix all resulting TypeScript errors in the backend source tree.

## Context

With all `.js` files renamed to `.ts`, enabling `noImplicitAny` forces every parameter and variable to have an explicit type. Errors are fixed by adding type annotations — not by suppressing with `any` unless truly unavoidable (in which case document the reason with a comment).

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `tsconfig.json` | modify | Set `noImplicitAny: true` |
| `src/**/*.ts` | modify | Fix any errors surfaced |

## Implementation Steps

### Step 1: Enable noImplicitAny
Set `"noImplicitAny": true` in `tsconfig.json`.

### Step 2: Run typecheck and collect errors
`yarn typecheck 2>&1 | head -100` to see the first batch of errors.

### Step 3: Fix errors in batches
Work layer by layer (helpers → models → repositories → services → controllers). Add explicit types. Use `any` only as a last resort with a `// TODO: type this` comment.

### Step 4: Final typecheck
`yarn typecheck` must exit with zero errors.

## Testing

- [ ] `yarn typecheck` passes with `noImplicitAny: true`
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `noImplicitAny: true` in root tsconfig
- [ ] Zero TS errors on backend
- [ ] Changes committed to `plan/js-to-ts/phase-5/task-27-enable-noimplicitany-backend` branch
- [ ] Status updated in `status.md`
