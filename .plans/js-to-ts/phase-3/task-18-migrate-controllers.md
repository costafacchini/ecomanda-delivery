# Task: Migrate controllers to .ts

**Plan**: JS to TypeScript Migration
**Phase**: 3
**Task Path**: phase-3/task-18-migrate-controllers
**Depends On**: phase-3/task-11-migrate-services
**JIRA**: N/A

## Objective

Rename all 17 controller files in `src/app/controllers/` from `.js` to `.ts`, typing `Request` and `Response` parameters from Express.

## Context

Controllers use Express `Request` and `Response` objects. After renaming, import `Request, Response` from `express` and type the method parameters. This is the primary consumer of Express types. Rename spec files alongside sources.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/**/*.js` | rename to `.ts` | 17 files |
| `src/app/controllers/**/*.spec.js` | rename to `.spec.ts` | |

## Implementation Steps

### Step 1: Rename each controller and spec
`.js` → `.ts`, `.spec.js` → `.spec.ts`. Add `req: Request, res: Response` types to handler methods.

### Step 2: Run typecheck and tests after each batch of 3–5 files

## Testing

- [ ] `yarn typecheck` passes
- [ ] `npx jest src/app/controllers/` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All 17 controller files renamed to `.ts`
- [ ] Express `Request`/`Response` types applied to all handlers
- [ ] Changes committed to `plan/js-to-ts/phase-3/task-18-migrate-controllers` branch
- [ ] Status updated in `status.md`
