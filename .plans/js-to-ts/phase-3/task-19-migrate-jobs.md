# Task: Migrate jobs to .ts

**Plan**: JS to TypeScript Migration
**Phase**: 3
**Task Path**: phase-3/task-19-migrate-jobs
**Depends On**: phase-3/task-11-migrate-services, phase-3/task-12-migrate-messenger-plugins, phase-3/task-13-migrate-chat-plugins
**JIRA**: N/A

## Objective

Rename all 20 job files in `src/app/jobs/` from `.js` to `.ts`.

## Context

Jobs depend on services and plugins. They must wait for services and the chat/messenger plugin groups to be migrated. Each job file is typically a thin wrapper that instantiates a service and calls `execute()`. Rename alongside any spec files.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/jobs/*.js` | rename to `.ts` | 20 files |
| `src/app/jobs/*.spec.js` | rename to `.spec.ts` | If any spec files exist |

## Implementation Steps

### Step 1: Rename each job file
`.js` → `.ts`. Add type annotations to constructor parameters and `execute()` calls.

### Step 2: Run typecheck and tests

## Testing

- [ ] `yarn typecheck` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All 20 job files renamed to `.ts`
- [ ] Changes committed to `plan/js-to-ts/phase-3/task-19-migrate-jobs` branch
- [ ] Status updated in `status.md`
