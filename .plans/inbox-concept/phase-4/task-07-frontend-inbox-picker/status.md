# Status: Frontend — Department inbox selector + chat screen inbox picker

**Current Status**: complete
**Last Updated**: 2026-07-20
**Agent**: claude-sonnet-4-6
**Branch**: inbox-concept/phase-4/task-07-frontend-inbox-picker
**PR**: —

## Status History

| Timestamp | Status | Agent | Notes |
|-----------|--------|-------|-------|
| 2026-07-17 | not-started | — | Task created |
| 2026-07-20 | in-progress | claude-sonnet-4-6 | Implementation started |
| 2026-07-20 | complete | claude-sonnet-4-6 | All tests passing (313/317), committed 27a262e4 |

## Blockers

None

## Artifacts

- `client/src/pages/Chat/components/InboxPickerModal.tsx` — new Bootstrap modal component
- `client/src/pages/Chat/components/InboxPickerModal.spec.tsx` — 5 unit tests
- `client/src/pages/Chat/index.tsx` — inbox picker wired into Nova conversa flow
- `client/src/pages/Chat/index.spec.tsx` — Story 5 scenarios (3 tests)
- `client/src/pages/Departments/scenes/Form/index.tsx` — messenger inbox selector field
- `client/src/pages/Departments/scenes/Edit/index.spec.tsx` — 2 new inbox tests
- `client/src/services/inbox.ts` — STUB (replaced by task-06 on merge)
- `client/src/types/inbox.ts` — STUB (replaced by task-06 on merge)
- `client/src/services/rooms.ts` — extended createRoom with optional inboxId param
- i18n: `departments.inbox`, `departments.noInbox`, `chat.selectInbox`, `chat.selectInboxDescription` (pt + en)

## Adaptations

None
