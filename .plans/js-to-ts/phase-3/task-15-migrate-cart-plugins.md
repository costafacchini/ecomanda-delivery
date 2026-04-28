# Task: Migrate plugins/carts to .ts

**Plan**: JS to TypeScript Migration
**Phase**: 3
**Task Path**: phase-3/task-15-migrate-cart-plugins
**Depends On**: phase-3/task-11-migrate-services
**JIRA**: N/A

## Objective

Rename all 6 cart plugin files plus adapter files in `src/app/plugins/carts/` from `.js` to `.ts`.

## Context

Cart plugins include `Alloy.js`, `Go2go.js`, `Go2goV2.js`, `factory.js` and adapters in `carts/adapters/`. Migrate top-level files first (including factory), then adapter files.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/carts/**/*.js` | rename to `.ts` | 6+ files including adapters |
| `src/app/plugins/carts/**/*.spec.js` | rename to `.spec.ts` | |

## Implementation Steps

### Step 1: Rename carts/adapters/ files first (leaf layer)
### Step 2: Rename top-level cart plugin files
### Step 3: Run typecheck and tests

## Testing

- [ ] `yarn typecheck` passes
- [ ] `npx jest src/app/plugins/carts/` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All cart plugin files renamed to `.ts`
- [ ] Changes committed to `plan/js-to-ts/phase-3/task-15-migrate-cart-plugins` branch
- [ ] Status updated in `status.md`
