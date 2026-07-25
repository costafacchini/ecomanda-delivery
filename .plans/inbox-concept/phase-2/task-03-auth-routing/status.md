# Status: Auth middleware + IngestMessengerMessage/Chat inbox threading

**Current Status**: complete
**Last Updated**: 2026-07-20
**Agent**: claude-sonnet-4-6
**Branch**: inbox-concept/phase-2/task-03-auth-routing
**PR**: —

## Status History

| Timestamp | Status | Agent | Notes |
|-----------|--------|-------|-------|
| 2026-07-17 | not-started | — | Task created |
| 2026-07-20 | in-progress | claude-sonnet-4-6 | Started implementation |
| 2026-07-20 | complete | claude-sonnet-4-6 | All 7 test suites passing (26 tests). ESLint clean. |

## Blockers

None

## Artifacts

- `src/app/routes/authenticate-licensee.ts` — extracted middleware (new file)
- `src/app/routes/api-routes.ts` — updated to import from authenticate-licensee, added inboxRepository
- `src/app/routes/api-routes.spec.ts` — updated import + added Story 3 inbox scenarios
- `src/app/usecases/webhooks/IngestMessengerMessage.ts` — inboxId parameter + inbox field on Body
- `src/app/usecases/webhooks/IngestMessengerMessage.inbox.spec.ts` — implemented inbox threading tests
- `src/app/usecases/webhooks/IngestChatMessage.ts` — inboxId parameter + inbox field on Body
- `src/app/usecases/webhooks/IngestChatMessage.spec.ts` — added inbox threading tests
- `src/app/controllers/MessengersController.ts` — passes inboxId to use case
- `src/app/controllers/MessengersController.spec.ts` — updated + inboxId test
- `src/app/controllers/ChatsController.ts` — passes inboxId to use case
- `src/app/controllers/ChatsController.spec.ts` — updated + inboxId test

## Adaptations

- Extracted `buildAuthenticateLicensee` into `authenticate-licensee.ts` to break the import chain
  that pulled Redis/queue into unit tests. The spec now imports from the isolated module.
  `api-routes.ts` re-exports the function for backward compatibility with existing consumers.
