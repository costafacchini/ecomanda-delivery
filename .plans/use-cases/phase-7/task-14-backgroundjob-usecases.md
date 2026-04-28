# Task: Extract ScheduleBackgroundjob use case

**Plan**: Use Cases
**Phase**: 7
**Task Path**: phase-7/task-14-backgroundjob-usecases
**Depends On**: phase-1/task-01-scaffold-usecases-dir
**JIRA**: N/A

## Objective

Extract `ScheduleBackgroundjob` use case from `BackgroundjobsController`, eliminating the `new Backgroundjob() + validateSync + save` antipattern and centralising the enqueue call.

## Context

`BackgroundjobsController.create` currently does `new Backgroundjob(fields); bgJob.validateSync(); bgJob.save()` then enqueues. `ScheduleBackgroundjob` use case receives `{ backgroundjobRepository, jobQueue }` and handles both persistence and scheduling in `execute(fields)`. Test uses `BackgroundjobRepositoryMemory` and mocks the queue.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/backgroundjobs/ScheduleBackgroundjob.js` | create | |
| `src/app/usecases/backgroundjobs/ScheduleBackgroundjob.spec.js` | create | |

## Implementation Steps

### Step 1: Read BackgroundjobsController
Read `src/app/controllers/BackgroundjobsController.js` to capture the create-and-enqueue logic.

### Step 2: Create ScheduleBackgroundjob
Constructor: `{ backgroundjobRepository, jobQueue }`. `execute(fields)` creates the record via repository, then enqueues the job.

### Step 3: Write spec
Mock queue. Use `BackgroundjobRepositoryMemory`. Assert record created and queue called.

## Testing

- [ ] `npx jest src/app/usecases/backgroundjobs/` passes without mongoServer
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] Use case file and spec created and passing
- [ ] Changes committed to `plan/use-cases/phase-7/task-14-backgroundjob-usecases` branch
- [ ] Status updated in `status.md`
