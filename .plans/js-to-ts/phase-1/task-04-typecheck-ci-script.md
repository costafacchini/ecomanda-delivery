# Task: Add typecheck script and verify zero TS errors

**Plan**: JS to TypeScript Migration
**Phase**: 1
**Task Path**: phase-1/task-04-typecheck-ci-script
**Depends On**: phase-1/task-02-tsconfig-root
**JIRA**: N/A

## Objective

Add a `typecheck` npm script that runs `tsc --noEmit` and verify it exits with zero errors on the current (all-JS) codebase. This script becomes the CI gate throughout the migration.

## Context

Having a dedicated `typecheck` script in `package.json` makes it easy to run in CI and locally. The script must pass with zero errors on the existing JS-only codebase — confirming that `allowJs: true` + `checkJs: false` means the compiler ignores JS files.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `package.json` | modify | Add `"typecheck": "tsc --noEmit"` to scripts |

## Implementation Steps

### Step 1: Add script
Add `"typecheck": "tsc --noEmit"` to the `scripts` section in `package.json`.

### Step 2: Verify
Run `yarn typecheck` — must exit with code 0 and zero errors.

## Testing

- [ ] `yarn typecheck` exits 0 with zero TS errors
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `typecheck` script present in `package.json`
- [ ] `yarn typecheck` passes on current codebase
- [ ] Changes committed to `plan/js-to-ts/phase-1/task-04-typecheck-ci-script` branch
- [ ] Status updated in `status.md`
