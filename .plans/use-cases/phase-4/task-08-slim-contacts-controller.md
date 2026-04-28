# Task: Slim ContactsController

**Plan**: Use Cases
**Phase**: 4
**Task Path**: phase-4/task-08-slim-contacts-controller
**Depends On**: phase-4/task-07-contact-usecases
**JIRA**: N/A

## Objective

Replace business logic in `ContactsController` with delegation to `CreateContact` and `UpdateContact`. Update `resources-routes.js` to inject the two use cases.

## Context

`ContactsController` constructor changes to receive `{ createContact, updateContact }`. Each method becomes a single `execute()` call plus HTTP response. `resources-routes.js` is updated to instantiate the use cases and inject them.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/ContactsController.js` | modify | Slim to HTTP adapter |
| `src/app/routes/resources-routes.js` | modify | Wire CreateContact and UpdateContact |

## Implementation Steps

### Step 1: Slim ContactsController
Replace `create` and `update` method bodies with use case delegation. Constructor receives `{ createContact, updateContact }`.

### Step 2: Update resources-routes.js
Instantiate `CreateContact` and `UpdateContact` and pass to `new ContactsController(...)`.

### Step 3: Update ContactsController.spec.js
Mock `createContact.execute` and `updateContact.execute`. Assert HTTP response behaviour only.

## Testing

- [ ] `npx jest src/app/controllers/ContactsController.spec.js` passes
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] No business logic in `ContactsController`
- [ ] Both use cases wired in route file
- [ ] Controller spec updated and passing
- [ ] Changes committed to `plan/use-cases/phase-4/task-08-slim-contacts-controller` branch
- [ ] Status updated in `status.md`
