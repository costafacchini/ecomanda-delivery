# Task: Migrate Mongoose models to .ts

**Plan**: JS to TypeScript Migration
**Phase**: 3
**Task Path**: phase-3/task-08-migrate-models
**Depends On**: phase-2/task-05-domain-types
**JIRA**: N/A

## Objective

Rename all 14 Mongoose model files in `src/app/models/` from `.js` to `.ts`, type schema fields, and export typed `Document` interfaces using Mongoose generics.

## Context

Each model file exports a Mongoose model. After renaming, add `Schema<IModelName>` typing where the interface exists in `src/types/index.ts`. For models without a pre-existing interface, create a local interface or extend the types file. Mongoose validator functions and virtuals can be left untyped initially (add `any` or suppress with `// eslint-disable`). Rename accompanying spec files to `.spec.ts`.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/models/*.js` | rename to `.ts` + add types | 14 files |
| `src/app/models/*.spec.js` | rename to `.spec.ts` | Matching test files |

## Implementation Steps

### Step 1: Rename and type each model
For each model: rename `.js` → `.ts`. Add `Schema<IModelName>` typing. Export a typed document interface. Rename spec.

### Step 2: Run typecheck
`yarn typecheck` must pass after all renames.

### Step 3: Run tests

## Testing

- [ ] `yarn typecheck` passes
- [ ] `npx jest src/app/models/` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All 14 model files renamed to `.ts` with typed schemas
- [ ] No remaining `.js` in `src/app/models/`
- [ ] Changes committed to `plan/js-to-ts/phase-3/task-08-migrate-models` branch
- [ ] Status updated in `status.md`
