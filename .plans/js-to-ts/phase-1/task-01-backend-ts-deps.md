# Task: Install backend TypeScript dependencies

**Plan**: JS to TypeScript Migration
**Phase**: 1
**Task Path**: phase-1/task-01-backend-ts-deps
**Depends On**: None
**JIRA**: N/A

## Objective

Add all backend TypeScript and type declaration packages needed to support incremental migration and Jest transform.

## Context

The backend uses Babel for Jest transforms and Node/Express for runtime. Packages needed: `typescript`, `tsx` (for running TS files in dev), `@types/node`, `@types/express`, `@types/bcrypt`, `@types/morgan`, `@types/jsonwebtoken`, and `@babel/preset-typescript` (so Jest can process `.ts` files without a separate ts-jest step).

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `package.json` | modify | Add devDependencies |

## Implementation Steps

### Step 1: Install packages
```
yarn add --dev typescript tsx @types/node @types/express @types/bcrypt @types/morgan @types/jsonwebtoken @babel/preset-typescript
```

### Step 2: Verify install
Run `npx tsc --version` to confirm TypeScript is available. Run `npx jest` to confirm existing tests still pass after adding the Babel preset (preset is not yet active — tsconfig comes in task-02).

## Testing

- [ ] `npx jest` passes (all existing tests)
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All listed packages present in `package.json` devDependencies
- [ ] Existing tests still pass
- [ ] Changes committed to `plan/js-to-ts/phase-1/task-01-backend-ts-deps` branch
- [ ] Status updated in `status.md`
