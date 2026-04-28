# Task: Migrate plugins/chatbots to .ts

**Plan**: JS to TypeScript Migration
**Phase**: 3
**Task Path**: phase-3/task-14-migrate-chatbot-plugins
**Depends On**: phase-3/task-11-migrate-services
**JIRA**: N/A

## Objective

Rename the 2 chatbot plugin files in `src/app/plugins/chatbots/` from `.js` to `.ts`.

## Context

Small set of files. Same rename-and-annotate pattern as other plugin groups.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/chatbots/*.js` | rename to `.ts` | 2 files |
| `src/app/plugins/chatbots/*.spec.js` | rename to `.spec.ts` | |

## Implementation Steps

### Step 1: Rename both files and specs, add type annotations
### Step 2: Run typecheck and tests

## Testing

- [ ] `yarn typecheck` passes
- [ ] `npx jest src/app/plugins/chatbots/` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] Both chatbot plugin files renamed to `.ts`
- [ ] Changes committed to `plan/js-to-ts/phase-3/task-14-migrate-chatbot-plugins` branch
- [ ] Status updated in `status.md`
