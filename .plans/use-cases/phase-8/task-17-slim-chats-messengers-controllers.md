# Task: Slim ChatsController and MessengersController

**Plan**: Use Cases
**Phase**: 8
**Task Path**: phase-8/task-17-slim-chats-messengers-controllers
**Depends On**: phase-8/task-16-webhook-usecases
**JIRA**: N/A

## Objective

Replace business logic in `ChatsController` and `MessengersController` with delegation to the two webhook ingestion use cases. Update route files to inject them.

## Context

After task-16, `ChatsController.message` delegates to `IngestChatMessage.execute` and `MessengersController.message` delegates to `IngestMessengerMessage.execute`. Route files instantiate the use cases and inject them.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/ChatsController.js` | modify | Slim message method |
| `src/app/controllers/MessengersController.js` | modify | Slim message method |
| `src/app/routes/v1/v1-routes.js` | modify | Wire webhook use cases |

## Implementation Steps

### Step 1: Slim both controllers
Replace `message` method body in each with use case delegation.

### Step 2: Update v1-routes.js
Instantiate `IngestChatMessage` and `IngestMessengerMessage` and inject into controllers.

### Step 3: Update controller specs

## Testing

- [ ] `npx jest src/app/controllers/ChatsController.spec.js src/app/controllers/MessengersController.spec.js` passes
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] No direct save/enqueue logic in either controller
- [ ] Use cases wired in route file
- [ ] Controller specs updated and passing
- [ ] Changes committed to `plan/use-cases/phase-8/task-17-slim-chats-messengers-controllers` branch
- [ ] Status updated in `status.md`
