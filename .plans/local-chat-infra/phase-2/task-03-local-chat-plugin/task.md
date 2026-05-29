# Task: LocalChat plugin + agent reply API

**Plan**: Local Chat Infrastructure
**Phase**: 2
**Task ID (phase-local)**: task-03
**Task Path**: phase-2/task-03-local-chat-plugin
**Depends On**: phase-1/task-01-user-role-system, phase-1/task-02-room-model
**JIRA**: N/A

## Objective

Create the `LocalChat` plugin that routes incoming messages to internal agents via Socket.IO, add an agent reply endpoint, and wire everything into the runtime dependency graph.

## Context

**How existing chat plugins work:**

`SendMessageToChat` job calls `chatPlugin.sendMessage(messageId, url)`. For Chatwoot, this POSTs the message to an external platform. For LocalChat, instead of an HTTP call, it:
1. Finds or creates a `Room` for the contact with `status: 'pending'`
2. Emits a Socket.IO event so connected agents are notified in real time

**Agent reply flow:**
Agent replies via `POST /v1/chat/rooms/:roomId/messages`. The controller formats the body to match what `LocalChat.parseMessage()` expects and calls `IngestChatMessage.execute()` — reusing the existing `chat-message` BullMQ pipeline unchanged.

**Socket.IO circular import problem:**

`LocalChat` is instantiated in `runtime/dependencies.js`. Importing `io` from `src/config/http.js` there would create:
```
http.js → routes.js → (no dep on dependencies.js) ✓
dependencies.js → http.js ← this is new
```
This is NOT circular today. But to keep the dependency clean and ensure the worker process (`worker.js`) doesn't accidentally load the HTTP server, create a `socketEmitter` singleton:

```
// src/app/services/socketEmitter.js
let _io = null
export const setIo = (io) => { _io = io }
export const emitToLicensee = (licenseeId, event, data) => {
  _io?.to(`licensee:${licenseeId}`).emit(event, data)
}
```

`http.js` calls `setIo(io)` after creating the Socket.IO server. LocalChat imports `emitToLicensee` directly — `_io` will be null in the worker process, which is fine (worker never calls LocalChat.sendMessage).

**`Licensee.chatDefault` enum:** Add `'local'` to the enum in `Licensee.js`. The pre-save hook that sets `whatsappUrl` based on `whatsappDefault` should not be affected.

**Socket.IO rooms:** Agents join a Socket.IO room keyed by licensee: `socket.join('licensee:<licenseeId>')`. This wiring is deferred to the agent inbox UI plan. For now, `emitToLicensee` emits to the room — agents already in the room will receive it; agents not yet connected will not (acceptable for initial infrastructure).

Read `src/app/plugins/chats/Chatwoot.js` for the full plugin pattern. Read `src/app/usecases/webhooks/IngestChatMessage.js` for the ingest pipeline.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/local-chat-infra/phase-2/task-03-local-chat-plugin`
- [ ] Verify `phase-1/task-01-user-role-system/status.md` shows `complete`
- [ ] Verify `phase-1/task-02-room-model/status.md` shows `complete`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Read `src/app/plugins/chats/Chatwoot.js` (full file — understand `sendMessage`, `parseMessage`, `closeChat`)
- [ ] Read `src/app/plugins/chats/factory.js`
- [ ] Read `src/app/plugins/chats/Base.js` (full file — understand `responseToMessages`)
- [ ] Read `src/app/usecases/webhooks/IngestChatMessage.js`
- [ ] Read `src/config/http.js`
- [ ] Read `src/app/models/Licensee.js` (find `chatDefault` enum)
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/services/socketEmitter.js` | create | Socket.IO singleton |
| `src/config/http.js` | modify | Call `setIo(io)` after Socket.IO init |
| `src/app/plugins/chats/LocalChat.js` | create | The plugin |
| `src/app/plugins/chats/LocalChat.spec.js` | create | Unit tests |
| `src/app/plugins/chats/factory.js` | modify | Add `'local'` case |
| `src/app/models/Licensee.js` | modify | Add `'local'` to `chatDefault` enum |
| `src/app/controllers/ChatRoomsController.js` | create | Agent reply endpoint handler |
| `src/app/controllers/ChatRoomsController.spec.js` | create | Controller tests |
| `src/app/routes/v1/v1-routes.js` | modify | Add agent reply route |
| `src/app/runtime/dependencies.js` | modify | Pass `roomRepository` to createChatPlugin |

### Do NOT Modify

- `src/app/models/Room.js` — complete (phase 1)
- `src/app/models/User.js` — complete (phase 1)
- `src/app/plugins/chats/Chatwoot.js` — read-only
- `client/src/` — owned by phase-2/task-04-frontend-super-flow

## Implementation Steps

### Step 1: Create `src/app/services/socketEmitter.js`

```js
let _io = null

const setIo = (io) => { _io = io }

const emitToLicensee = (licenseeId, event, data) => {
  _io?.to(`licensee:${licenseeId.toString()}`).emit(event, data)
}

export { setIo, emitToLicensee }
```

### Step 2: Update `src/config/http.js`

After `const io = new Server(server)`, add:
```js
import { setIo } from '../app/services/socketEmitter.js'
// ...
setIo(io)
```

### Step 3: Create `src/app/plugins/chats/LocalChat.js`

```js
class LocalChat extends ChatsBase {
  constructor(licensee, { roomRepository, ...dependencies } = {}) {
    super(licensee, dependencies)
    this._roomRepository = roomRepository
  }

  action(_responseBody) {
    return 'send-message-to-messenger'
  }

  async sendMessage(messageId) {
    const message = await this.messageRepository.findFirst({ _id: messageId }, ['contact'])
    if (!message) return

    let room = await this._roomRepository.findOpenForContact(message.contact._id)
    if (!room) {
      room = await this._roomRepository.create({
        contact: message.contact._id,
        status: 'pending',
      })
    }

    message.sended = true
    await this.messageRepository.save(message)

    emitToLicensee(this.licensee._id, 'new-room-message', {
      roomId: room._id,
      messageId: message._id,
      licenseeId: this.licensee._id,
    })
  }

  async parseMessage(body) {
    // body shape: { roomId, text, agentId }
    if (!body?.roomId || !body?.text) {
      this.messageParsed = null
      return
    }

    const room = await this._roomRepository.findFirst({ _id: body.roomId }, ['contact'])
    if (!room || room.closed) {
      this.messageParsed = null
      return
    }

    this.messageParsed = {
      contact: room.contact,
      room,
      action: this.action(),
      messages: [{ kind: 'text', text: { body: body.text }, senderName: body.agentName ?? null }],
    }
  }

  async closeChat(messageId) {
    const message = await this.messageRepository.findFirst({ _id: messageId }, ['contact', 'room'])
    if (!message?.room) return []

    const room = await this._roomRepository.findFirst({ _id: message.room._id })
    room.status = 'closed'
    await this._roomRepository.save(room)

    const messages = []
    if (this.licensee.messageOnCloseChat) {
      // reuse ChatsBase pattern if needed
    }

    return messages
  }
}
```

Import `emitToLicensee` from `socketEmitter.js`.

### Step 4: Add `'local'` to chat factory

```js
case 'local':
  return new LocalChat(licensee, dependencies)
```

### Step 5: Add `'local'` to `Licensee.chatDefault` enum

Find the `chatDefault` field in `Licensee.js` and add `'local'` to the enum array.

### Step 6: Create `ChatRoomsController` and agent reply route

```js
// POST /v1/chat/rooms/:roomId/messages
// body: { text }
// Auth: any authenticated user (agent, supervisor, admin, super)
async replyToRoom(req, res) {
  const { roomId } = req.params
  const { text } = req.body
  const agentId = req.userId

  const user = await userRepository.findFirst({ _id: agentId })
  const room = await roomRepository.findFirst({ _id: roomId }, ['contact'])

  if (!room || room.closed) {
    return res.status(404).json({ message: 'Conversa não encontrada ou encerrada.' })
  }

  const body = { roomId, text, agentId, agentName: user?.name ?? null }
  await ingestChatMessage.execute({ body, licenseeId: room.contact.licensee })

  return res.status(200).json({ message: 'Mensagem enviada.' })
}
```

Add to `v1-routes.js`:
```js
router.post('/chat/rooms/:roomId/messages', authenticate, chatRoomsController.replyToRoom)
```

### Step 7: Wire `roomRepository` into `createChatPlugin` in `dependencies.js`

The `LocalChat` constructor needs `roomRepository`. Ensure `roomRepository` is passed to `createChatPluginFactory` in `buildRuntimeDependencies`.

## Testing

- [ ] `LocalChat.sendMessage()` — creates Room with `status: 'pending'` when no open room exists
- [ ] `LocalChat.sendMessage()` — reuses existing open room when one exists
- [ ] `LocalChat.sendMessage()` — calls `emitToLicensee` with correct event and payload
- [ ] `LocalChat.sendMessage()` — marks message as `sended: true`
- [ ] `LocalChat.parseMessage()` — sets `messageParsed` with correct shape for valid body
- [ ] `LocalChat.parseMessage()` — sets `messageParsed = null` for closed rooms
- [ ] `LocalChat.parseMessage()` — sets `messageParsed = null` when `text` is missing
- [ ] `LocalChat.closeChat()` — sets `room.status = 'closed'`
- [ ] `ChatRoomsController.replyToRoom()` — returns 404 for closed/missing room
- [ ] `ChatRoomsController.replyToRoom()` — calls `ingestChatMessage.execute()` for valid room
- [ ] Chat factory returns `LocalChat` for `chatDefault: 'local'`
- [ ] All existing chat plugin tests pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc updates required at this task — document when local chat is fully end-to-end working

## Completion Criteria

- [ ] `LocalChat` plugin created and registered in factory
- [ ] `socketEmitter` wired in `http.js`
- [ ] Agent reply endpoint functional
- [ ] `'local'` added to `Licensee.chatDefault` enum
- [ ] All tests pass
- [ ] Changes committed to `plan/local-chat-infra/phase-2/task-03-local-chat-plugin` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-04 modifies `client/src/` only. No backend file overlap with this task.
