# Task: Verify cra-to-vite prerequisite is complete

**Plan**: JS to TypeScript Migration
**Phase**: 0
**Task Path**: phase-0/task-00-verify-cra-to-vite-complete
**Depends On**: None
**JIRA**: N/A

## Objective

Confirm that the `cra-to-vite` plan is fully complete so that Phase 4 (client migration) can proceed on a Vite-based client. This task is a gate check only — no code changes.

## Context

Phase 4 requires the client to already be running on Vite. The `cra-to-vite` plan replaced CRA with Vite. This task verifies that `vite build` runs cleanly and `vitest run` passes before any TypeScript client work begins.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| — | verify only | No files modified in this task |

## Implementation Steps

### Step 1: Run vite build
`yarn build` (or the client build command) — must succeed with no errors.

### Step 2: Run vitest
`npx vitest run` (client) — all tests must pass.

### Step 3: Mark complete
If both pass, mark this task complete. If either fails, resolve the cra-to-vite plan first.

## Testing

- [ ] `vite build` succeeds
- [ ] `vitest run` passes

## Completion Criteria

- [ ] Both checks pass
- [ ] Status updated in `status.md`
