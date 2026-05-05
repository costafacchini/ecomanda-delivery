# Task: Extract IngestChatMessage and IngestMessengerMessage use cases

**Plan**: Use Cases
**Phase**: 8
**Task Path**: phase-8/task-16-webhook-usecases
**Depends On**: phase-1/task-01-scaffold-usecases-dir
**JIRA**: N/A

## Objective

Extract `IngestChatMessage` and `IngestMessengerMessage` use cases from `ChatsController` and `MessengersController` respectively (optional phase — logic is thin but consistent with the pattern).

## Context

Both controllers follow the same pattern: save the request body to a repository and enqueue a job. `IngestChatMessage` receives `{ chatRepository, jobQueue }` and enqueues `chat-message`. `IngestMessengerMessage` receives `{ messengerRepository, jobQueue }` and enqueues `messenger-message`. Specs mock the queue and use in-memory repositories.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/webhooks/IngestChatMessage.js` | create | |
| `src/app/usecases/webhooks/IngestChatMessage.spec.js` | create | |
| `src/app/usecases/webhooks/IngestMessengerMessage.js` | create | |
| `src/app/usecases/webhooks/IngestMessengerMessage.spec.js` | create | |

## Implementation Steps

### Step 1: Read ChatsController and MessengersController
Confirm the exact save/enqueue pattern.

### Step 2: Create both use cases
Constructor-injected repositories and queue. `execute(body)` saves then enqueues.

### Step 3: Write specs

## Testing

- [ ] `npx jest src/app/usecases/webhooks/` passes without mongoServer
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No product or API documentation changes expected for this extraction alone
- [ ] If the chat/messenger ingestion pattern becomes reusable for later use-case extractions, capture it with `document-solution`
- [ ] If any KB files change, run `check-kb-index`

## Completion Criteria

- [ ] Both use case files and specs created and passing
- [ ] Changes committed to `plan/use-cases/phase-8/task-16-webhook-usecases` branch
- [ ] Status updated in `status.md`
