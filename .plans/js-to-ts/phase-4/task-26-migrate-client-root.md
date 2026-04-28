# Task: Migrate App.js, index.js, and root client files to .tsx

**Plan**: JS to TypeScript Migration
**Phase**: 4
**Task Path**: phase-4/task-26-migrate-client-root
**Depends On**: phase-4/task-25-migrate-client-pages
**JIRA**: N/A

## Objective

Rename the remaining root-level client files (`App.js`, `index.js`, `setupTests.js`, and any remaining root-level `.js` files) to `.tsx`/`.ts`. This completes the client rename.

## Context

`App.js` and `index.js` are the entry points. After renaming to `.tsx`, run `vitest run` and `vite build` to confirm the fully TypeScript client compiles and all tests pass.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/App.js` | rename to `App.tsx` | |
| `client/src/index.js` | rename to `index.tsx` | |
| `client/src/setupTests.js` | rename to `setupTests.ts` | If it exists |
| Other root `client/src/*.js` | rename to `.ts` or `.tsx` | |

## Implementation Steps

### Step 1: Rename each remaining root file
### Step 2: Run vitest run and vite build — both must pass
This is the client migration milestone.

## Testing

- [ ] `vitest run` passes
- [ ] `vite build` succeeds
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] No `.js`/`.jsx` files remain in `client/src/` (except node_modules)
- [ ] `vitest run` and `vite build` both pass
- [ ] Changes committed to `plan/js-to-ts/phase-4/task-26-migrate-client-root` branch
- [ ] Status updated in `status.md`
