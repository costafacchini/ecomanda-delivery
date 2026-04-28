# Task: Migrate importers, factories, and reports to .ts

**Plan**: JS to TypeScript Migration
**Phase**: 3
**Task Path**: phase-3/task-17-migrate-importers-factories-reports
**Depends On**: phase-3/task-08-migrate-models
**JIRA**: N/A

## Objective

Rename all importer (2 files), factory (12 files), and report (1 file) source files from `.js` to `.ts`.

## Context

Factories are test support files — they depend on models to create fixture data. Importers and reports are application-level utilities. All depend on models but not on services, so they can be migrated in parallel with services. Factories used in tests: rename alongside their test consumers where possible.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/factories/*.js` | rename to `.ts` | 12 files |
| `src/app/importers/**/*.js` | rename to `.ts` | 2 files |
| `src/app/reports/*.js` | rename to `.ts` | 1 file |

## Implementation Steps

### Step 1: Rename importers and reports (leaf-ish, small)
### Step 2: Rename factories (depend on models)
### Step 3: Run typecheck and tests

## Testing

- [ ] `yarn typecheck` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All importer, factory, and report files renamed to `.ts`
- [ ] Changes committed to `plan/js-to-ts/phase-3/task-17-migrate-importers-factories-reports` branch
- [ ] Status updated in `status.md`
