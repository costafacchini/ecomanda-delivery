# Task: Migrate client/src/components/ to .tsx

**Plan**: JS to TypeScript Migration
**Phase**: 4
**Task Path**: phase-4/task-24-migrate-client-components
**Depends On**: phase-4/task-23-migrate-client-contexts
**JIRA**: N/A

## Objective

Rename all component files in `client/src/components/` from `.js`/`.jsx` to `.tsx` and add prop type annotations.

## Context

Components depend on contexts. After renaming, add `interface Props` or inline prop types to each component. Rename spec/test files alongside. This is the largest rename step on the client side — work in batches by sub-directory if `components/` has sub-folders.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/**/*.js` | rename to `.tsx` | All component files |
| `client/src/components/**/*.spec.js` | rename to `.spec.tsx` | |

## Implementation Steps

### Step 1: Rename components in batches
Process sub-directories one at a time. Run `vitest run` after each batch.

### Step 2: Add prop types
Add `interface Props` to each component and type the function parameter.

## Testing

- [ ] `vitest run` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All component files renamed to `.tsx` with prop types
- [ ] Changes committed to `plan/js-to-ts/phase-4/task-24-migrate-client-components` branch
- [ ] Status updated in `status.md`
