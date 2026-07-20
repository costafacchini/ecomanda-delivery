# Status: Inbox model + CRUD API + Baileys endpoints

**Current Status**: complete
**Last Updated**: 2026-07-20
**Agent**: claude-sonnet-4-6
**Branch**: inbox-concept/phase-1/task-01-inbox-model-api
**PR**: —

## Status History

| Timestamp | Status | Agent | Notes |
|-----------|--------|-------|-------|
| 2026-07-17 | not-started | — | Task created |
| 2026-07-20 | in-progress | claude-sonnet-4-6 | Branch created, implementing Inbox model, repository, controller, Baileys use cases |
| 2026-07-20 | complete | claude-sonnet-4-6 | All files created, tests passing (53 new tests), no regressions |

## Blockers

None

## Artifacts

### Created
- `src/app/models/Inbox.ts` — Mongoose model with inboxToken UUID, webhookUrl virtual, timestamps
- `src/app/models/Inbox.spec.ts` — 10 tests covering pre-save, webhookUrl virtual, validations
- `src/app/repositories/inbox.ts` — InboxRepositoryDatabase + InboxRepositoryMemory
- `src/app/repositories/inbox.spec.ts` — 3 tests: model(), create, find with licensee filter
- `src/app/factories/inbox.ts` — Fishery factory (kind: messenger, whatsappDefault: baileys)
- `src/app/usecases/licensees/GetBaileysQrForInbox.ts`
- `src/app/usecases/licensees/GetBaileysQrForInbox.spec.ts` — 6 tests
- `src/app/usecases/licensees/GetBaileysStatusForInbox.ts`
- `src/app/usecases/licensees/GetBaileysStatusForInbox.spec.ts` — 8 tests
- `src/app/usecases/licensees/SyncBaileysDirectoryForInbox.ts`
- `src/app/usecases/licensees/SyncBaileysDirectoryForInbox.spec.ts` — 7 tests
- `src/app/controllers/InboxesController.ts` — index, create, update, destroy, baileysQr, baileysStatus, baileysSync
- `src/app/controllers/InboxesController.spec.ts` — 19 tests

### Modified
- `src/app/models/index.ts` — added Inbox import
- `src/app/repositories/index.ts` — added inbox import
- `src/app/repositories/testing.ts` — wired InboxRepository into memory harness
- `src/app/runtime/dependencies.ts` — added InboxRepositoryDatabase to dependency graph
- `src/app/routes/resources-routes.ts` — registered /inboxes CRUD + Baileys sub-routes

## Adaptations

None
