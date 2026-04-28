# Task: Migrate plugins/chats to .ts

**Plan**: JS to TypeScript Migration
**Phase**: 3
**Task Path**: phase-3/task-13-migrate-chat-plugins
**Depends On**: phase-3/task-11-migrate-services
**JIRA**: N/A

## Objective

Rename all 6 chat plugin files (plus Base) in `src/app/plugins/chats/` from `.js` to `.ts`. Migrate Base first, then subclasses.

## Context

Same pattern as messenger plugins. Base class first, then subclasses. Rename specs alongside sources.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/chats/*.js` | rename to `.ts` | Base + 6 files |
| `src/app/plugins/chats/*.spec.js` | rename to `.spec.ts` | |

## Implementation Steps

### Step 1: Rename Base first, run typecheck
### Step 2: Rename each subclass and spec

## Testing

- [ ] `yarn typecheck` passes
- [ ] `npx jest src/app/plugins/chats/` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All chat plugin files renamed to `.ts`
- [ ] Changes committed to `plan/js-to-ts/phase-3/task-13-migrate-chat-plugins` branch
- [ ] Status updated in `status.md`
