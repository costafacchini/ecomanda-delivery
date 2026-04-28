# Task: Migrate repositories to .ts

**Plan**: JS to TypeScript Migration
**Phase**: 3
**Task Path**: phase-3/task-09-migrate-repositories
**Depends On**: phase-3/task-08-migrate-models
**JIRA**: N/A

## Objective

Rename the base `Repository` class and all 10 repository files in `src/app/repositories/` from `.js` to `.ts`, typing `create`, `find`, and `update` return values using the model document interfaces.

## Context

Repositories are the first layer above models. Typing them precisely unlocks accurate type inference in services and use cases. The base `Repository` class should use generics so subclasses inherit typed return values. Rename spec files in the same PR.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/repositories/*.js` | rename to `.ts` + add types | Base class + 10 repository files |
| `src/app/repositories/*.spec.js` | rename to `.spec.ts` | |

## Implementation Steps

### Step 1: Type the base Repository
Add a generic type parameter `<T>` to the base class. `create`, `find`, `update` return `Promise<T>` or `Promise<T[]>` as appropriate.

### Step 2: Rename and type each concrete repository
Each extends `Repository<IModelName>`. Rename `.js` → `.ts` and `.spec.js` → `.spec.ts`.

### Step 3: Run typecheck and tests

## Testing

- [ ] `yarn typecheck` passes
- [ ] `npx jest src/app/repositories/` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] Base repository and all 10 repository files renamed to `.ts`
- [ ] Typed return values on CRUD methods
- [ ] Changes committed to `plan/js-to-ts/phase-3/task-09-migrate-repositories` branch
- [ ] Status updated in `status.md`
