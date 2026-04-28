# Task: Configure Jest/Babel to process .ts files

**Plan**: JS to TypeScript Migration
**Phase**: 1
**Task Path**: phase-1/task-03-jest-babel-ts-transform
**Depends On**: phase-1/task-01-backend-ts-deps
**JIRA**: N/A

## Objective

Update `babel.config.json` to include `@babel/preset-typescript` and update `jest.config.mjs` transform pattern to cover both `.js` and `.ts` files.

## Context

Babel is already used for Jest transforms. Adding `@babel/preset-typescript` lets Babel strip TypeScript types without a full tsc compilation pass — keeping test runs fast. The Jest transform regex needs to change from `^.+\.js$` to `^.+\.(js|ts)$` (or similar). `testMatch` or `testRegex` should also include `.spec.ts`.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `babel.config.json` | modify | Add @babel/preset-typescript |
| `jest.config.mjs` | modify | Update transform + testMatch |

## Implementation Steps

### Step 1: Read current babel.config.json and jest.config.mjs
Capture existing preset list and transform pattern.

### Step 2: Update babel.config.json
Add `"@babel/preset-typescript"` to the presets array.

### Step 3: Update jest.config.mjs
Change transform key regex from `\.js$` to `\.(js|ts)$`. Add `**/*.spec.ts` to `testMatch` if it uses explicit matching.

### Step 4: Verify
Run `npx jest` — all existing tests must still pass. Create a temporary `.spec.ts` test file to confirm TS files are picked up, then delete it.

## Testing

- [ ] `npx jest` passes with no regressions
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `babel.config.json` includes `@babel/preset-typescript`
- [ ] `jest.config.mjs` transform covers `.ts` files
- [ ] All existing tests pass
- [ ] Changes committed to `plan/js-to-ts/phase-1/task-03-jest-babel-ts-transform` branch
- [ ] Status updated in `status.md`
