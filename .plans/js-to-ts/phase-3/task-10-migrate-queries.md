# Task: Migrate queries layer to .ts

**Plan**: JS to TypeScript Migration
**Phase**: 3
**Task Path**: phase-3/task-10-migrate-queries
**Depends On**: phase-3/task-09-migrate-repositories
**JIRA**: N/A

## Objective

Rename all 10 query files in `src/app/queries/` from `.js` to `.ts` and add type annotations.

## Context

Query objects encapsulate MongoDB aggregation pipelines or finder helpers. They depend on models and repositories. Rename each query file and its spec. Add return type annotations using existing model interfaces.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/queries/*.js` | rename to `.ts` + add types | 10 files |
| `src/app/queries/*.spec.js` | rename to `.spec.ts` | |

## Implementation Steps

### Step 1: Rename each query file and spec
`.js` → `.ts`, `.spec.js` → `.spec.ts`.

### Step 2: Add type annotations
Type method parameters and return values.

### Step 3: Run typecheck and tests

## Testing

- [ ] `yarn typecheck` passes
- [ ] `npx jest src/app/queries/` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All query files renamed to `.ts`
- [ ] Changes committed to `plan/js-to-ts/phase-3/task-10-migrate-queries` branch
- [ ] Status updated in `status.md`
