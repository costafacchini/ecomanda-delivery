# Task: Migrate src/app/helpers/ to .ts

**Plan**: JS to TypeScript Migration
**Phase**: 2
**Task Path**: phase-2/task-06-migrate-helpers
**Depends On**: phase-2/task-05-domain-types
**JIRA**: N/A

## Objective

Rename all 9 helper files in `src/app/helpers/` from `.js` to `.ts`, add parameter and return type annotations, and rename their `.spec.js` files to `.spec.ts` in the same commit.

## Context

Helpers are leaf modules with no imports from upper layers — safest place to start the rename chain. Type annotations should use types from `src/types/index.ts` where applicable. The `allowJs: true` config means any file not yet renamed continues to work.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/helpers/*.js` | rename to `.ts` + add types | 9 files |
| `src/app/helpers/*.spec.js` | rename to `.spec.ts` | Matching test files |

## Implementation Steps

### Step 1: List helper files
`ls src/app/helpers/` to get the exact file list.

### Step 2: Rename and type each file
For each helper: rename `.js` → `.ts`, rename `.spec.js` → `.spec.ts`. Add type annotations to function parameters and return values. Use `string`, `number`, `boolean`, and domain interfaces from `src/types/index.ts` as appropriate.

### Step 3: Fix any consumer imports
If any other file imports a helper by `.js` extension, update the import.

### Step 4: Run typecheck and tests
`yarn typecheck` and `npx jest` must both pass.

## Testing

- [ ] `yarn typecheck` passes
- [ ] `npx jest src/app/helpers/` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All 9 helper files renamed to `.ts` with type annotations
- [ ] All helper specs renamed to `.spec.ts`
- [ ] No remaining `.js` files in `src/app/helpers/`
- [ ] Changes committed to `plan/js-to-ts/phase-2/task-06-migrate-helpers` branch
- [ ] Status updated in `status.md`
