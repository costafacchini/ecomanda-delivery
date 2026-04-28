# Task: Migrate routes, websockets, and server entry to .ts

**Plan**: JS to TypeScript Migration
**Phase**: 3
**Task Path**: phase-3/task-20-migrate-routes-websockets-entry
**Depends On**: phase-3/task-18-migrate-controllers
**JIRA**: N/A

## Objective

Rename all 5 route files, 3 websocket files, and server entry points (`server.js`, `worker.js`) from `.js` to `.ts`. This is the final backend rename step.

## Context

Route files and entry points are the top layer of the backend. They depend on controllers and all plugin/service layers below. After this task, the entire backend source tree should be `.ts`. Verify with `yarn typecheck` and full test suite.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/routes/**/*.js` | rename to `.ts` | 5 files |
| `src/app/websockets/**/*.js` | rename to `.ts` | 3 files |
| `server.js` | rename to `server.ts` | Entry point |
| `worker.js` | rename to `worker.ts` | Worker entry |

## Implementation Steps

### Step 1: Rename websocket files (no controller dependency)
### Step 2: Rename route files
### Step 3: Rename server entry points
### Step 4: Run typecheck — this is the final backend milestone
`yarn typecheck` must pass with zero errors. `npx jest` must pass.

## Testing

- [ ] `yarn typecheck` passes (backend fully migrated)
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] No `.js` files remain in `src/` (except `node_modules`)
- [ ] `yarn typecheck` passes
- [ ] Full test suite passes
- [ ] Changes committed to `plan/js-to-ts/phase-3/task-20-migrate-routes-websockets-entry` branch
- [ ] Status updated in `status.md`
