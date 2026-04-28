# Task: Migrate src/config/ and src/setup/ to .ts

**Plan**: JS to TypeScript Migration
**Phase**: 2
**Task Path**: phase-2/task-07-migrate-config-setup
**Depends On**: phase-1/task-02-tsconfig-root
**JIRA**: N/A

## Objective

Rename all 7 files in `src/config/` and all files in `src/setup/` from `.js` to `.ts`, adding type annotations where useful.

## Context

Config and setup files are early-loaded and have simple shapes (environment variable reads, database connection setup, logger config). Renaming them establishes the TS pattern for infrastructure files and removes them from the unmigrated count.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/config/*.js` | rename to `.ts` | 7 files |
| `src/setup/*.js` | rename to `.ts` | All setup files |

## Implementation Steps

### Step 1: List config and setup files
`ls src/config/ src/setup/` to get exact file list.

### Step 2: Rename and annotate each file
Rename `.js` → `.ts`. Add return types to exported functions. Type `process.env` reads where straightforward.

### Step 3: Run typecheck and tests

## Testing

- [ ] `yarn typecheck` passes
- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All config and setup files renamed to `.ts`
- [ ] `yarn typecheck` still passes
- [ ] Changes committed to `plan/js-to-ts/phase-2/task-07-migrate-config-setup` branch
- [ ] Status updated in `status.md`
