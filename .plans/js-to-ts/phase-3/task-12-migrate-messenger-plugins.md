# Task: Migrate plugins/messengers to .ts

**Plan**: JS to TypeScript Migration
**Phase**: 3
**Task Path**: phase-3/task-12-migrate-messenger-plugins
**Depends On**: phase-3/task-11-migrate-services
**JIRA**: N/A

## Objective

Rename all 6 messenger plugin files (plus the Base class) in `src/app/plugins/messengers/` from `.js` to `.ts` and add type annotations. Migrate the Base class first, then subclasses.

## Context

Messenger plugins inherit from a common Base class. The migration order is: Base class first so subclasses inherit typed method signatures. Rename spec files alongside source files.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/messengers/*.js` | rename to `.ts` + add types | Base + 6 files |
| `src/app/plugins/messengers/*.spec.js` | rename to `.spec.ts` | |

## Implementation Steps

### Step 1: Rename Base class first
Type method signatures in the Base class. Run `yarn typecheck`.

### Step 2: Rename each subclass
`.js` → `.ts`, `.spec.js` → `.spec.ts`. Fix any type errors surfaced by the typed Base class.

### Step 3: Run typecheck and tests

## Testing

- [ ] `yarn typecheck` passes
- [ ] `npx jest src/app/plugins/messengers/` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All messenger plugin files renamed to `.ts`
- [ ] Changes committed to `plan/js-to-ts/phase-3/task-12-migrate-messenger-plugins` branch
- [ ] Status updated in `status.md`
