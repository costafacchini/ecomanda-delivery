# Task: Migrate client/src/pages/ to .tsx

**Plan**: JS to TypeScript Migration
**Phase**: 4
**Task Path**: phase-4/task-25-migrate-client-pages
**Depends On**: phase-4/task-24-migrate-client-components
**JIRA**: N/A

## Objective

Rename all page files in `client/src/pages/` from `.js`/`.jsx` to `.tsx` and add type annotations.

## Context

Pages depend on components and contexts. They are higher-level compositions — typically no complex prop interfaces, but route params may need typing.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/**/*.js` | rename to `.tsx` | All page files |
| `client/src/pages/**/*.spec.js` | rename to `.spec.tsx` | |

## Implementation Steps

### Step 1: Rename each page file and spec
### Step 2: Run vitest run

## Testing

- [ ] `vitest run` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All page files renamed to `.tsx`
- [ ] Changes committed to `plan/js-to-ts/phase-4/task-25-migrate-client-pages` branch
- [ ] Status updated in `status.md`
