# Socket.IO — JWT-Authenticated Licensee Room Join

**Last Updated**: June 2026
**Context**: Read when adding Socket.IO real-time events to a new feature, wiring client-side socket subscriptions, or extending the `join-licensee` mechanism.

---

## Overview

The app uses Socket.IO for real-time push to the chat UI. Clients subscribe to a licensee-scoped room (`licensee:{id}`) so they only receive events for their own data. JWT is validated on the socket handshake (not per-message), and the `join-licensee` handler validates the ObjectId format before joining.

---

## The Problem

### Symptoms
- New inbound messages needed to appear in the chat UI without polling
- Without authentication, any client could subscribe to any licensee's room by sending an arbitrary `join-licensee` event

### Root Cause
Socket.IO's default setup has no auth layer — the `connection` handler fires for every client. The `join-licensee` event accepts arbitrary strings, which could be used to join unrelated licensee rooms.

---

## The Solution

### Key Files

| File | Role |
|------|------|
| `src/config/http.ts` | Socket.IO server setup — JWT middleware + `join-licensee` handler |
| `src/app/services/socketEmitter.ts` | `setIo` / `emitToLicensee` singleton — emit side |
| `src/app/plugins/chats/LocalChat.ts` | Calls `emitToLicensee` after processing an inbound message |
| `client/src/hooks/useChatSocket.ts` | React hook — connect, join, listen, cleanup |

### Server-Side Pattern (`src/config/http.ts`)

```ts
const SECRET = process.env.SECRET as string
const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/

const io = new Server(server)

// Validate JWT on every new connection
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
    // Guard: only valid MongoDB ObjectIds — prevents joining arbitrary room names
    if (typeof licenseeId === 'string' && OBJECT_ID_REGEX.test(licenseeId)) {
      socket.join(`licensee:${licenseeId}`)
    }
  })
})

setIo(io)   // make io available to emitToLicensee
```

### Emit Side (`src/app/services/socketEmitter.ts`)

```ts
const emitToLicensee = (licenseeId: any, event: string, data: any) => {
  _io?.to(`licensee:${licenseeId.toString()}`).emit(event, data)
}
```

Emitted from `LocalChat.ts` after saving a message:
```ts
emitToLicensee(this.licensee._id, 'new-room-message', {
  roomId: room._id,
  messageId: message._id,
  licenseeId: this.licensee._id,
})
```

### Client-Side Hook (`client/src/hooks/useChatSocket.ts`)

```ts
export function useChatSocket(
  licenseeId: string | undefined,
  onNewRoomMessage: (data: NewRoomMessageData) => void,
) {
  useEffect(() => {
    if (!licenseeId) return

    const socket = io({ auth: { token: getToken() } })
    socket.emit('join-licensee', licenseeId)
    socket.on('new-room-message', onNewRoomMessage)

    return () => { socket.disconnect() }
  }, [licenseeId]) // eslint-disable-line react-hooks/exhaustive-deps
}
```

Integrated in `ChatPage`:
```ts
useChatSocket(effectiveLicenseeId, ({ roomId }) => {
  if (selectedRoom?._id === roomId) {
    loadMessages(selectedRoom._id)       // refresh active conversation
  } else {
    setRooms(prev =>                     // bump unread badge
      prev.map(r => r._id === roomId ? { ...r, unreadCount: (r.unreadCount ?? 0) + 1 } : r)
    )
  }
})
```

---

## Gotchas

### `eslint-disable react-hooks/exhaustive-deps`
`onNewRoomMessage` is intentionally omitted from the effect dependency array. Including it would reconnect the socket on every render. Callers should memoize the callback with `useCallback` if needed.

### `SECRET` must be defined at socket setup time
`process.env.SECRET` is read at module load. In tests that exercise `http.ts` directly, set `process.env.SECRET` before importing or the `jwt.verify` call will throw `secretOrPrivateKey must have a value`.

### `io()` call uses the current page origin
`io()` with no URL argument connects to the same host serving the SPA — correct for production and `vite dev` proxy. Don't pass a hardcoded URL.

### ObjectId regex guards join, not auth
The regex `/^[a-f0-9]{24}$/` only prevents joining rooms with non-ObjectId names. Authorization (can this user actually access this licensee?) relies on the JWT middleware having already run. A compromised token could still join any licensee room — the guard is defense-in-depth, not the primary auth check.

---

## Related

- [`project-overview`](../architecture/project-overview.md) — overall entry points and plugin architecture
- [`express-conventions`](../architecture/express-conventions.md) — JWT `authenticate` middleware used in HTTP routes
