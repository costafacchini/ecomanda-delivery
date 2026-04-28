# Task: Enable @typescript-eslint/recommended rules in ESLint

**Plan**: JS to TypeScript Migration
**Phase**: 5
**Task Path**: phase-5/task-30-eslint-ts-rules
**Depends On**: phase-5/task-29-enable-strict-mode
**JIRA**: N/A

## Objective

Update `eslint.config.mjs` to enable `@typescript-eslint/recommended` rules and remove any JavaScript-only rules that conflict with TypeScript.

## Context

After the full migration, the codebase is all TypeScript. The ESLint config should reflect this: add `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser`, enable `@typescript-eslint/recommended`, and remove JS rules that are superseded (e.g. `no-unused-vars` → `@typescript-eslint/no-unused-vars`). All existing lint violations must be fixed before merging.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `eslint.config.mjs` | modify | Add TS plugin and rules |
| `package.json` | modify | Add @typescript-eslint/* deps if not already present |

## Implementation Steps

### Step 1: Install ESLint TS plugins if needed
`yarn add --dev @typescript-eslint/eslint-plugin @typescript-eslint/parser`

### Step 2: Update eslint.config.mjs
Add `@typescript-eslint/recommended` extends. Set `parser: '@typescript-eslint/parser'`. Replace JS-only rules with TS equivalents.

### Step 3: Run lint
`npx eslint .` — fix all new violations.

### Step 4: Run full verification

## Testing

- [ ] `npx eslint .` passes with zero errors
- [ ] `yarn typecheck`, `npx jest`, `vitest run`, `vite build` all pass
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] ESLint configured with `@typescript-eslint/recommended`
- [ ] Zero lint errors
- [ ] All tests and builds pass
- [ ] Changes committed to `plan/js-to-ts/phase-5/task-30-eslint-ts-rules` branch
- [ ] Status updated in `status.md`
