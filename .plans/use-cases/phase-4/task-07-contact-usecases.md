# Task: Extract CreateContact and UpdateContact use cases

**Plan**: Use Cases
**Phase**: 4
**Task Path**: phase-4/task-07-contact-usecases
**Depends On**: phase-1/task-01-scaffold-usecases-dir
**JIRA**: N/A

## Objective

Extract `CreateContact` and `UpdateContact` use cases from `ContactsController`, each with a spec that runs without `mongoServer`.

## Context

`ContactsController.create` creates a contact and enqueues a `send-contact-to-pagarme` job. `ContactsController.update` updates a contact and enqueues the same job. Both use cases receive `{ contactRepository, jobQueue }` (or whatever queue abstraction is established). Tests use `ContactRepositoryMemory` and mock the job queue.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/contacts/CreateContact.js` | create | |
| `src/app/usecases/contacts/CreateContact.spec.js` | create | |
| `src/app/usecases/contacts/UpdateContact.js` | create | |
| `src/app/usecases/contacts/UpdateContact.spec.js` | create | |

## Implementation Steps

### Step 1: Read ContactsController
Read `src/app/controllers/ContactsController.js` to capture field logic and job enqueue call.

### Step 2: Create CreateContact
Constructor: `{ contactRepository, jobQueue }`. `execute(fields)` creates the contact then enqueues the pagarme job.

### Step 3: Create UpdateContact
Constructor: `{ contactRepository, jobQueue }`. `execute(id, fields)` updates the contact then enqueues the pagarme job.

### Step 4: Write specs
Use `ContactRepositoryMemory`. Mock job queue. Assert record state and that the queue method is called.

## Testing

- [ ] `npx jest src/app/usecases/contacts/` passes without mongoServer
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] Both use case files and specs created and passing
- [ ] Changes committed to `plan/use-cases/phase-4/task-07-contact-usecases` branch
- [ ] Status updated in `status.md`
