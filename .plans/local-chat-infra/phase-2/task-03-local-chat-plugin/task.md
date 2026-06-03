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

`LocalChat` is instantiated in `runtime/dependencies.ts`. Importing `io` from `src/config/http.ts` there would create:
```
http.ts → routes.ts → (no dep on dependencies.ts) ✓
dependencies.ts → http.ts ← this is new
```
This is NOT circular today. But to keep the dependency clean and ensure the worker process (`worker.ts`) doesn't accidentally load the HTTP server, create a `socketEmitter` singleton:

```
// src/app/services/socketEmitter.ts
let _io: any = null
export const setIo = (io: any) => { _io = io }
export const emitToLicensee = (licenseeId: any, event: string, data: any) => {
  _io?.to(`licensee:${licenseeId}`).emit(event, data)
}
```

`http.ts` calls `setIo(io)` after creating the Socket.IO server. LocalChat imports `emitToLicensee` directly — `_io` will be null in the worker process, which is fine (worker never calls LocalChat.sendMessage).

**`Licensee.chatDefault` enum:** Add `'local'` to the enum in `Licensee.ts`. The pre-save hook that sets `whatsappUrl` based on `whatsappDefault` should not be affected.

**Socket.IO rooms:** Agents join a Socket.IO room keyed by licensee: `socket.join('licensee:<licenseeId>')`. This wiring is deferred to the agent inbox UI plan. For now, `emitToLicensee` emits to the room — agents already in the room will receive it; agents not yet connected will not (acceptable for initial infrastructure).

Read `src/app/plugins/chats/Chatwoot.ts` for the full plugin pattern. Read `src/app/usecases/webhooks/IngestChatMessage.ts` for the ingest pipeline.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/local-chat-infra/phase-2/task-03-local-chat-plugin`
- [ ] Verify `phase-1/task-01-user-role-system/status.md` shows `complete`
- [ ] Verify `phase-1/task-02-room-model/status.md` shows `complete`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Read `src/app/plugins/chats/Chatwoot.ts` (full file — understand `sendMessage`, `parseMessage`, `closeChat`)
- [ ] Read `src/app/plugins/chats/factory.ts`
- [ ] Read `src/app/plugins/chats/Base.ts` (full file — understand `responseToMessages`)
- [ ] Read `src/app/usecases/webhooks/IngestChatMessage.ts`
- [ ] Read `src/config/http.ts`
- [ ] Read `src/app/models/Licensee.ts` (find `chatDefault` enum)
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/services/socketEmitter.ts` | create | Socket.IO singleton |
| `src/config/http.ts` | modify | Call `setIo(io)` after Socket.IO init |
| `src/app/plugins/chats/LocalChat.ts` | create | The plugin |
| `src/app/plugins/chats/LocalChat.spec.ts` | create | Unit tests |
| `src/app/plugins/chats/factory.ts` | modify | Add `'local'` case |
| `src/app/models/Licensee.ts` | modify | Add `'local'` to `chatDefault` enum |
| `src/app/controllers/ChatRoomsController.ts` | create | Agent reply endpoint handler |
| `src/app/controllers/ChatRoomsController.spec.ts` | create | Controller tests |
| `src/app/routes/v1/v1-routes.ts` | modify | Add agent reply route |
| `src/app/runtime/dependencies.ts` | modify | Pass `roomRepository` to createChatPlugin |

### Do NOT Modify

- `src/app/models/Room.ts` — complete (phase 1)
- `src/app/models/User.ts` — complete (phase 1)
- `src/app/plugins/chats/Chatwoot.ts` — read-only
- `client/src/` — owned by phase-2/task-04-frontend-super-flow

## Implementation Steps

### Step 1: Create `src/app/services/socketEmitter.ts`

```ts
let _io: any = null

const setIo = (io: any) => { _io = io }

const emitToLicensee = (licenseeId: any, event: string, data: any) => {
  _io?.to(`licensee:${licenseeId.toString()}`).emit(event, data)
}

export { setIo, emitToLicensee }
```

### Step 2: Update `src/config/http.ts`

After `const io = new Server(server)`, add:
```ts
import { setIo } from '../app/services/socketEmitter'
// ...
setIo(io)
```

### Step 3: Create `src/app/plugins/chats/LocalChat.ts`

```ts
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

Import `emitToLicensee` from `socketEmitter`.

### Step 4: Add `'local'` to chat factory

```js
case 'local':
  return new LocalChat(licensee, dependencies)
```

### Step 5: Add `'local'` to `Licensee.chatDefault` enum

Find the `chatDefault` field in `Licensee.ts` and add `'local'` to the enum array.

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

Add to `v1-routes.ts`:
```ts
router.post('/chat/rooms/:roomId/messages', authenticate, chatRoomsController.replyToRoom)
```

### Step 7: Wire `roomRepository` into `createChatPlugin` in `dependencies.ts`

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
- [ ] `socketEmitter` wired in `http.ts`
- [ ] Agent reply endpoint functional
- [ ] `'local'` added to `Licensee.chatDefault` enum
- [ ] All tests pass
- [ ] Changes committed to `plan/local-chat-infra/phase-2/task-03-local-chat-plugin` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-04 modifies `client/src/` only. No backend file overlap with this task.
