# Task: Migrate services layer to .ts

**Plan**: JS to TypeScript Migration
**Phase**: 3
**Task Path**: phase-3/task-11-migrate-services
**Depends On**: phase-3/task-09-migrate-repositories
**JIRA**: N/A

## Objective

Rename all 18 service files in `src/app/services/` from `.js` to `.ts` and add type annotations. Rename accompanying spec files.

## Context

Services are the main business logic layer — they depend on repositories, plugins, and helpers. Most services have a single `execute()` or named method. Type parameters and return values. Rename specs in the same PR.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/services/*.js` | rename to `.ts` + add types | 18 files |
| `src/app/services/*.spec.js` | rename to `.spec.ts` | |

## Implementation Steps

### Step 1: Rename and type each service file
`.js` → `.ts`, `.spec.js` → `.spec.ts`. Add parameter and return type annotations.

### Step 2: Run typecheck and tests after each batch
Rename in small batches (3–5 files) and run `yarn typecheck` after each batch to catch errors early.

## Testing

- [ ] `yarn typecheck` passes
- [ ] `npx jest src/app/services/` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All 18 service files renamed to `.ts`
- [ ] All service specs renamed to `.spec.ts`
- [ ] Changes committed to `plan/js-to-ts/phase-3/task-11-migrate-services` branch
- [ ] Status updated in `status.md`
