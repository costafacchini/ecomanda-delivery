# Plan: Local Chat UI

**Status**: complete
**Created**: 2026-06-15
**Last Updated**: 2026-06-17
**Assigned Dev**: Alan Costa Facchini
**PR Strategy**: per-wave

## Objective

Build the agent-facing frontend for the local chat: a full-screen WhatsApp-style page at `/chat`, conditionally linked from the navbar, backed by new REST endpoints (with sector-aware filtering and agent-initiated room creation), a LocalChat sector-assignment fix, and wired to real-time Socket.IO events already emitted by the backend plugin.

## Scope

### In Scope
- **LocalChat sector fix** — when `LocalChat.sendMessage` creates a new room, it must carry `message.sector` into the room so that sector-scoped filtering works
- `GET /resources/rooms` — list open rooms for the requesting user's effective licensee, filtered by the agent's sectors when applicable
- `POST /resources/rooms` — create a room (contact + sector) for agent-initiated conversations; returns existing open room if one already exists for that contact
- `GET /resources/rooms/:roomId/messages` — paginated message history for a room
- `/chat` page — full-screen layout (own viewport, no Bootstrap container), sidebar + conversation panel, adapted from whatsapp-web-clone components
- **Nova conversa** — "+" button in the sidebar opens contact search (reuses `SelectContactsWithFilter`), creates a room via `POST /resources/rooms`, auto-selects it
- Navbar link — shown only when `effectiveLicensee.chatDefault === 'local'`
- `PrivateRoute` — add `noLayout` prop to skip BaseLayout wrapping (needed for full-screen route)
- Socket.IO client integration — join `licensee:{id}` room, receive `new-room-message` events in real time
- Server-side socket join handler — accept `join-licensee` event from clients (with JWT validation)

### Out of Scope
- Agent assignment / room claiming UI — rooms are displayed as they arrive; assignment deferred
- File/image attachment sending — text messages only in this plan
- Typing indicators, read receipts, push notifications — deferred
- Room search / filtering — deferred

## Kill Criteria

- If the sector-filtering logic causes N+1 queries at scale, stop and redesign using a join/aggregation pipeline
- If the Socket.IO join mechanism conflicts with security requirements (unauthenticated clients joining arbitrary licensee rooms), stop and design an authenticated join flow before proceeding with task-04

## Prerequisites

- `local-chat-infra` plan: complete ✓ — LocalChat plugin, Room model (with `sector` field), agent reply endpoint, socketEmitter singleton all exist
- `setores-webhook-providers` plan: complete ✓ — messages arriving via sector webhooks already carry `message.sector`
- `type-client` plan: complete ✓ — all `any` replaced with typed interfaces; `useApp()` hook is the correct context access pattern; `activeLicensee.id` (not `._id`) is the primary licensee ID field

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Backend API | task-01, task-02 | None | Rooms API (sector-aware) + LocalChat sector assignment fix — parallel, no shared files |
| 2 | Chat Page | task-03 | Phase 1 | Full-screen chat UI, Nova conversa flow, navbar link, routing |
| 3 | Real-Time | task-04 | Phase 2 | Socket.IO join handler (server) + useChatSocket hook (client) |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-rooms-api | Rooms API endpoints (sector-aware) | 1 | not-started | — |
| phase-1/task-02-localchat-sector | LocalChat: assign sector to new rooms | 1 | not-started | — |
| phase-2/task-03-chat-page | Chat page UI + Nova conversa + routing + navbar | 2 | not-started | phase-1/task-01-rooms-api, phase-1/task-02-localchat-sector |
| phase-3/task-04-socket-realtime | Socket.IO real-time integration | 3 | not-started | phase-2/task-03-chat-page |

## Branch Convention

Pattern: `plan/local-chat-ui/{task-path}`

Example branches:
- `plan/local-chat-ui/phase-1/task-01-rooms-api`
- `plan/local-chat-ui/phase-1/task-02-localchat-sector`
- `plan/local-chat-ui/phase-2/task-03-chat-page`
- `plan/local-chat-ui/phase-3/task-04-socket-realtime`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/app/controllers/RoomsController.ts` | NEW — index, create, messages actions |
| `src/app/routes/resources-routes.ts` | Add GET /rooms, POST /rooms, GET /rooms/:id/messages |
| `src/app/repositories/room.ts` | Add `findForLicensee()` with sector scoping |
| `src/app/models/Room.ts` | Reference — existing schema (has `sector` field) |
| `src/app/plugins/chats/LocalChat.ts` | Fix `sendMessage` to pass `message.sector` when creating room |
| `src/config/http.ts` | Add `join-licensee` socket event handler with JWT validation |
| `client/src/pages/Chat/` | NEW — full-screen chat page + components |
| `client/src/pages/Chat/components/NewConversationModal.tsx` | NEW — contact search + room creation |
| `client/src/types/room.ts` | NEW — `IRoom` interface (room + lastMessage + unreadCount) |
| `client/src/services/rooms.ts` | NEW — getRooms, createRoom, getRoomMessages, sendMessage |
| `client/src/hooks/useChatSocket.ts` | NEW — socket.io-client hook |
| `client/src/pages/routes.tsx` | Add /chat route with noLayout PrivateRoute |
| `client/src/pages/Navbar/index.tsx` | Add conditional Chat link |
| `client/src/pages/PrivateRoute/index.tsx` | Add noLayout prop |

## Risks

- **Sector N+1** — the `findForLicensee` method fetches contacts by licensee, then rooms by contactId list. Adding sector lookup (fetch sectors by userId, then filter rooms by sectorId) may cascade. Mitigation: use `$in` queries with index-backed fields; sectors per agent are bounded (single-digit).
- **Unauthenticated socket joins** — validate JWT in socket handshake middleware and ObjectId format in `join-licensee` handler (task-04).
- **Duplicate rooms** — `POST /resources/rooms` must return the existing open room if one already exists for the contact, not create a second one.
- **PrivateRoute change** — additive only (`noLayout` defaults to `false`); no existing callers break.

## Success Criteria

- [ ] New inbound message via LocalChat creates a room with the correct `sector` field populated
- [ ] `GET /resources/rooms` returns only rooms belonging to the agent's sectors; agent with no sectors sees all rooms for the licensee
- [ ] `POST /resources/rooms` creates a room (or returns existing open one) for the given contact
- [ ] `GET /resources/rooms/:roomId/messages` returns paginated messages; unauthorized rooms return 403
- [ ] Navigating to `/#/chat` shows the full-screen chat layout when the active licensee has `chatDefault: 'local'`
- [ ] Navbar shows a "Chat" link only when `effectiveLicensee?.chatDefault === 'local'`
- [ ] "Nova conversa" opens contact search, creates a room, auto-selects it in the sidebar
- [ ] Clicking a room in the sidebar loads its message history
- [ ] Agent can send a text reply; message appears in the conversation
- [ ] New inbound messages appear in real time without page refresh
- [ ] Rooms with unread messages show an unread count badge
- [ ] All backend tests pass: `npx jest`
- [ ] Frontend tests pass: `npx vitest run` inside `client/`
- [ ] `npx eslint .` produces no new errors
- [ ] No regressions in existing pages

## References

- **JIRA Epic**: N/A
- **Related Plans**: [Local Chat Infrastructure](../local-chat-infra/overview.md) — prerequisite (complete); [Setores](../setores/overview.md) — sector model used here
- **whatsapp-web-clone source**: `/Users/alan/Developer/pessoal/whatsapp-web-clone/src`
- **Rock Alignment**: N/A
