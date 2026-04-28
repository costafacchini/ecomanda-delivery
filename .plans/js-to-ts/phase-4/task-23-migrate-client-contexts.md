# Task: Migrate client/src/contexts/ to .tsx

**Plan**: JS to TypeScript Migration
**Phase**: 4
**Task Path**: phase-4/task-23-migrate-client-contexts
**Depends On**: phase-4/task-21-client-ts-setup
**JIRA**: N/A

## Objective

Rename all context files in `client/src/contexts/` from `.js`/`.jsx` to `.tsx` and add React/TypeScript type annotations.

## Context

React context files define typed context values and provider components. After renaming, type the context value shape with an interface. Rename spec files alongside sources.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/contexts/**/*.js` | rename to `.tsx` | All context files |
| `client/src/contexts/**/*.spec.js` | rename to `.spec.tsx` | |

## Implementation Steps

### Step 1: Rename each context file
`.js` → `.tsx`. Add interface for context value type.

### Step 2: Run vitest run

## Testing

- [ ] `vitest run` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All context files renamed to `.tsx`
- [ ] Changes committed to `plan/js-to-ts/phase-4/task-23-migrate-client-contexts` branch
- [ ] Status updated in `status.md`
