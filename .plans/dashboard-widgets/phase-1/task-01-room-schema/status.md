# Status: Room schema — add closedAt field

**Current Status**: complete
**Last Updated**: 2026-05-07
**Agent**: Alpha-VII
**Branch**: plan/dashboard-widgets/phase-1/task-01-room-schema
**PR**: —

## Status History

| Timestamp | Status | Agent | Notes |
|-----------|--------|-------|-------|
| 2026-05-07 | not-started | — | Task created |
| 2026-05-07 | in-progress | Alpha-VII | Implementation started |
| 2026-05-07 | complete | Alpha-VII | All 5 close sites updated, all tests pass, eslint clean |

## Blockers

None

## Artifacts

- `src/app/models/Room.js` — added `closedAt: { type: Date }` field
- `src/app/plugins/chats/Rocketchat.js` — set `room.closedAt = new Date()` at 2 close sites
- `src/app/plugins/chats/Chatwoot.js` — set `closedAt = new Date()` at 2 close sites
- `src/app/plugins/chatbots/Landbot.js` — set `room.closedAt = new Date()` at 1 close site

## Adaptations

None
