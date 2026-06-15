# Task: Socket.IO real-time integration

**Plan**: Local Chat UI
**Phase**: 3
**Task ID (phase-local)**: task-03
**Task Path**: phase-3/task-03-socket-realtime
**Depends On**: phase-2/task-02-chat-page
**JIRA**: N/A

## Objective

Wire the existing backend `new-room-message` Socket.IO event to the chat page: add a server-side `join-licensee` handler so clients can subscribe to their licensee's room, then build a `useChatSocket` hook that connects the frontend and updates the conversation in real time.

## Context

**Backend socket setup** (`src/config/http.ts`):
```ts
const io = new Server(server)
io.on('connection', (_) => {})   // currently empty
setIo(io)
```

**Existing emit** (`LocalChat.ts`):
```ts
emitToLicensee(this.licensee._id, 'new-room-message', {
  roomId: room._id,
  messageId: message._id,
  licenseeId: this.licensee._id,
})
// emitToLicensee does: io.to(`licensee:${licenseeId}`).emit(event, data)
```

So clients must join `licensee:{id}` to receive events. The join happens via a custom `join-licensee` event from the client.

**Frontend socket.io-client** is already installed: `client/package.json` has `"socket.io-client": "4.8.3"`. Server is `"socket.io": "4.8.3"`.

**Security note**: the server currently accepts unauthenticated connections. For this plan, require the JWT token in the Socket.IO handshake (`auth.token`) and validate it server-side before allowing `join-licensee`. This prevents arbitrary clients from joining licensee rooms.

The `new-room-message` payload is `{ roomId, messageId, licenseeId }`. The frontend needs to fetch the full message (or use the existing REST endpoint) and append it to the conversation. The simplest approach: on receiving the event, if `roomId` matches the selected room, call `GET /resources/rooms/:roomId/messages` to reload messages (or fetch only the new message by adding a `GET /resources/messages/:id` endpoint).

**Simpler approach**: reload the last page of messages for the current room when a `new-room-message` event arrives for that room. Alternatively, call the existing rooms messages endpoint. This avoids a new `/messages/:id` endpoint.

**For rooms the agent is NOT currently viewing**: bump an unread count badge on the `RoomItem` in the sidebar.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-2/task-02-chat-page/status.md` shows `complete`
- [ ] Read `src/config/http.ts` — current socket.io server setup
- [ ] Read `src/app/services/socketEmitter.ts` — `emitToLicensee` pattern
- [ ] Read `client/src/pages/Chat/index.tsx` (created in task-02) — understand state structure
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/config/http.ts` | modify | Add `join-licensee` event handler with JWT validation |
| `client/src/hooks/useChatSocket.ts` | create | Socket.IO hook |
| `client/src/pages/Chat/index.tsx` | modify | Use `useChatSocket` hook |
| `client/src/pages/Chat/components/RoomList.tsx` | modify | Accept + display unread count per room |
| `client/src/pages/Chat/components/RoomItem.tsx` | modify | Render unread badge |
| `client/src/hooks/useChatSocket.spec.ts` | create | Hook tests |

### Do NOT Modify

- `src/app/services/socketEmitter.ts` — stable; emit side is already correct
- `src/app/plugins/chats/LocalChat.ts` — stable

## Implementation Steps

### Step 1: Add `join-licensee` handler to `src/config/http.ts`

Add JWT validation on the handshake and a room-join handler:

```ts
import jwt from 'jsonwebtoken'

const SECRET = process.env.SECRET as string

io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error('Authentication required'))
  jwt.verify(token, SECRET, (err: any) => {
    if (err) return next(new Error('Invalid token'))
    next()
  })
})

io.on('connection', (socket) => {
  socket.on('join-licensee', (licenseeId: string) => {
    if (typeof licenseeId === 'string' && licenseeId.match(/^[a-f0-9]{24}$/)) {
      socket.join(`licensee:${licenseeId}`)
    }
  })
})
```

The ObjectId format check (`/^[a-f0-9]{24}$/`) prevents joining arbitrary room names.

### Step 2: Create `client/src/hooks/useChatSocket.ts`

```ts
import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { getToken } from '../services/auth'  // adjust import path to match existing pattern

export function useChatSocket(
  licenseeId: string | undefined,
  onNewRoomMessage: (data: { roomId: string; messageId: string; licenseeId: string }) => void,
) {
  useEffect(() => {
    if (!licenseeId) return

    const socket = io({ auth: { token: getToken() } })
    socket.emit('join-licensee', licenseeId)
    socket.on('new-room-message', onNewRoomMessage)

    return () => {
      socket.disconnect()
    }
  }, [licenseeId]) // eslint-disable-line react-hooks/exhaustive-deps
}
```

Check `client/src/services/auth.ts` for the `getToken` export name.

### Step 3: Update `client/src/pages/Chat/index.tsx`

1. Import and call `useChatSocket`:
```ts
const effectiveLicenseeId = (activeLicensee?._id ?? currentUser?.licensee?._id)?.toString()

useChatSocket(effectiveLicenseeId, ({ roomId }) => {
  if (selectedRoom && selectedRoom._id === roomId) {
    // Reload messages for the active conversation
    loadMessages(selectedRoom._id)
  } else {
    // Bump unread count for that room in the sidebar
    setRooms(prev =>
      prev.map(r => r._id === roomId ? { ...r, unreadCount: (r.unreadCount ?? 0) + 1 } : r)
    )
  }
})
```

2. When a room is selected, clear its `unreadCount`:
```ts
function handleRoomSelect(room: any) {
  setSelectedRoom({ ...room, unreadCount: 0 })
  setRooms(prev => prev.map(r => r._id === room._id ? { ...r, unreadCount: 0 } : r))
  loadMessages(room._id)
}
```

### Step 4: Update `RoomItem.tsx` for unread badge

Accept `unreadCount` prop; render a badge when > 0:
```tsx
{unreadCount > 0 && <span className="badge bg-success rounded-pill">{unreadCount}</span>}
```

### Step 5: Write `useChatSocket.spec.ts`

Mock `socket.io-client` with `vi.mock`. Tests:
- Does not connect when `licenseeId` is undefined
- Connects and emits `join-licensee` when `licenseeId` is provided
- Calls `onNewRoomMessage` when `new-room-message` is received
- Disconnects on cleanup (return of useEffect)

## Testing

- [ ] `useChatSocket.spec.ts` passes with mocked socket.io-client
- [ ] `npx vitest run` inside `client/` — all existing tests still pass
- [ ] `npx jest` (backend) — all tests still pass
- [ ] Manual smoke: open `/chat`, open a second browser tab and trigger an inbound message via the v1 webhook endpoint; message appears in real time

## Documentation / KB Updates

- [ ] After completion, run `document-solution` — the Socket.IO join pattern (server-side JWT validation + licensee room) is non-obvious and reusable.
- [ ] Run `check-kb-index` after the KB doc is added.

## Completion Criteria

- [ ] Server accepts `join-licensee` event only from JWT-authenticated clients; validates ObjectId format
- [ ] `useChatSocket` hook connects, subscribes, and cleans up correctly
- [ ] New messages appear in the active conversation without page refresh
- [ ] Rooms with new messages show an unread count badge in the sidebar
- [ ] All tests pass (backend + frontend)
- [ ] Lint clean
- [ ] `document-solution` run; KB index updated
- [ ] Status updated to `complete` in `status.md`
- [ ] Changes committed to `plan/local-chat-ui/phase-3/task-03-socket-realtime`

## Conflict Avoidance Notes

No sibling tasks in Phase 3.
