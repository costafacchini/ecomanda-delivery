# Plan: Local Chat UI

**Status**: not-started
**Created**: 2026-06-15
**Last Updated**: 2026-06-15
**Assigned Dev**: Alan Costa Facchini
**PR Strategy**: per-wave

## Objective

Build the agent-facing frontend for the local chat: a full-screen WhatsApp-style page at `/chat`, conditionally linked from the navbar, backed by two new REST endpoints and wired to real-time Socket.IO events already emitted by the `LocalChat` backend plugin.

## Scope

### In Scope
- `GET /resources/rooms` — list open rooms for the requesting user's effective licensee
- `GET /resources/rooms/:roomId/messages` — paginated message history for a room
- `/chat` page — full-screen layout (own viewport, no Bootstrap container), sidebar + conversation panel, adapted from whatsapp-web-clone components
- Navbar link — shown only when `effectiveLicensee.chatDefault === 'local'`
- `PrivateRoute` — add `noLayout` prop to skip BaseLayout wrapping (needed for full-screen route)
- Socket.IO client integration — join `licensee:{id}` room, receive `new-room-message` events in real time
- Server-side socket join handler — accept `join-licensee` event from clients

### Out of Scope
- Agent assignment / room claiming UI — rooms are displayed as they arrive; assignment deferred
- File/image attachment sending — text messages only in this plan
- Typing indicators — deferred
- Read receipts / message status — deferred
- Push notifications — deferred
- Room search / filtering — deferred

## Kill Criteria

- If the Socket.IO join mechanism conflicts with security requirements (unauthenticated clients joining arbitrary licensee rooms), stop and design an authenticated join flow before proceeding with task-03
- If adapting whatsapp-web-clone CSS causes major visual regressions on existing pages, scope styles to a dedicated CSS module

## Prerequisites

- `local-chat-infra` plan: complete ✓ — LocalChat plugin, Room model, agent reply endpoint, socketEmitter singleton all exist

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Backend API | task-01 | None | New RoomsController with index + messages endpoints |
| 2 | Chat Page | task-02 | Phase 1 | Full-screen chat UI, navbar link, routing |
| 3 | Real-Time | task-03 | Phase 2 | Socket.IO join handler (server) + useChatSocket hook (client) |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-rooms-api | Rooms API endpoints | 1 | not-started | — |
| phase-2/task-02-chat-page | Chat page UI + routing + navbar | 2 | not-started | phase-1/task-01-rooms-api |
| phase-3/task-03-socket-realtime | Socket.IO real-time integration | 3 | not-started | phase-2/task-02-chat-page |

## Branch Convention

Pattern: `plan/local-chat-ui/{task-path}`

Example branches:
- `plan/local-chat-ui/phase-1/task-01-rooms-api`
- `plan/local-chat-ui/phase-2/task-02-chat-page`
- `plan/local-chat-ui/phase-3/task-03-socket-realtime`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/app/controllers/RoomsController.ts` | NEW — index + messages actions |
| `src/app/routes/resources-routes.ts` | Add GET /rooms and GET /rooms/:roomId/messages |
| `src/app/repositories/room.ts` | Add `findForLicensee()` helper |
| `src/app/models/Room.ts` | Reference — existing schema |
| `src/config/http.ts` | Add `join-licensee` socket event handler |
| `client/src/pages/Chat/` | NEW — full-screen chat page + components |
| `client/src/services/rooms.ts` | NEW — getRooms, getRoomMessages, sendMessage |
| `client/src/hooks/useChatSocket.ts` | NEW — socket.io-client hook |
| `client/src/pages/routes.tsx` | Add /chat route with noLayout PrivateRoute |
| `client/src/pages/Navbar/index.tsx` | Add conditional Chat link |
| `client/src/pages/PrivateRoute/index.tsx` | Add noLayout prop |

## Risks

- **Unauthenticated socket joins** — `join-licensee` could allow arbitrary clients to join any licensee room. Mitigation: validate licenseeId against the authenticated user server-side in the join handler (task-03); for now, ensure the socket server rejects joins from unauthenticated clients by requiring a valid JWT handshake in the connection.
- **PrivateRoute change** — adding `noLayout` prop touches a shared component. Mitigation: additive-only change (default `false`), no existing callers need updating.
- **CSS scope bleed** — whatsapp-web-clone CSS uses global class names. Mitigation: scope all styles inside a `chat-layout` root selector or use CSS modules.

## Success Criteria

- [ ] `GET /resources/rooms` returns open rooms for the authenticated user's licensee; super can filter by `?licensee=`
- [ ] `GET /resources/rooms/:roomId/messages` returns paginated messages; unauthorized rooms return 403
- [ ] Navigating to `/#/chat` shows the full-screen chat layout when the active licensee has `chatDefault: 'local'`
- [ ] Navbar shows a "Chat" link only when `effectiveLicensee?.chatDefault === 'local'`
- [ ] Clicking a room in the sidebar loads its message history
- [ ] Agent can send a text reply via the input bar; message appears in the conversation
- [ ] New inbound messages appear in real time without page refresh
- [ ] All backend tests pass: `npx jest`
- [ ] Frontend tests pass: `npx vitest run` inside `client/`
- [ ] `npx eslint .` produces no new errors
- [ ] No regressions in existing pages

## References

- **JIRA Epic**: N/A
- **Related Plans**: [Local Chat Infrastructure](../local-chat-infra/overview.md) — prerequisite (complete)
- **whatsapp-web-clone source**: `/Users/alan/Developer/pessoal/whatsapp-web-clone/src`
- **Rock Alignment**: N/A
