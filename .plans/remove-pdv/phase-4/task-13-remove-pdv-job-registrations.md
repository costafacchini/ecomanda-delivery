# Task: Remove PDV job registrations from jobs/index.ts

**Plan**: Remove PDV Domain
**Phase**: 4
**Task Path**: phase-4/task-13-remove-pdv-job-registrations
**Depends On**: phase-4/task-12-delete-pdv-jobs
**JIRA**: N/A

## Objective

Remove all PDV job registrations and imports from `src/app/jobs/index.ts` (or equivalent job registration file).

## Context

After deleting the 12 job files in task-12, the job registration file still references them. This task cleans up those registrations so the job runner does not attempt to load deleted files.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/jobs/index.ts` | modify | Remove PDV job imports and registrations |

## Implementation Steps

### Step 1: Read jobs/index.ts
Identify all imports and registrations for the 12 deleted job files.

### Step 2: Remove each deleted job's import and registration line

### Step 3: Run tests

## Testing

- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `jobs/index.ts` has no references to the 12 deleted PDV jobs
- [ ] Changes committed to `plan/remove-pdv/phase-4/task-13-remove-pdv-job-registrations` branch
- [ ] Status updated in `status.md`
