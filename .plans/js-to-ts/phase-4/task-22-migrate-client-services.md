# Task: Migrate client/src/services/ to .ts

**Plan**: JS to TypeScript Migration
**Phase**: 4
**Task Path**: phase-4/task-22-migrate-client-services
**Depends On**: phase-4/task-21-client-ts-setup
**JIRA**: N/A

## Objective

Rename all non-component `.js` service and utility files in `client/src/services/` from `.js` to `.ts`, adding type annotations.

## Context

Client services are non-React files (API calls, utilities). They are leaf modules on the client side — best migrated first. Rename specs alongside sources.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/services/*.js` | rename to `.ts` | All service files |
| `client/src/services/*.spec.js` | rename to `.spec.ts` | |

## Implementation Steps

### Step 1: Rename each service file and spec
### Step 2: Add type annotations (request/response shapes, return types)
### Step 3: Run vitest run

## Testing

- [ ] `vitest run` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All client service files renamed to `.ts`
- [ ] Changes committed to `plan/js-to-ts/phase-4/task-22-migrate-client-services` branch
- [ ] Status updated in `status.md`
