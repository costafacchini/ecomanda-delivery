# Task: Use Case — SendWidgetMessage

**Plan**: Chat Widget
**Phase**: 2
**Task ID (phase-local)**: task-04
**Task Path**: phase-2/task-04-send-widget-message
**Depends On**: phase-1/task-01-contact-web-type
**JIRA**: N/A

## Objective

Implement `SendWidgetMessage` — the use case called when a widget visitor sends a chat message. It creates a `Message` record and calls `LocalChat.sendMessage()` directly to assign a Room and emit the `new-room-message` Socket.IO event to the licensee's agent dashboard.

## Context

Normal messenger inbound flow: webhook → BullMQ → `send-message-to-chat` job → `LocalChat.sendMessage`. For widget messages, BullMQ is bypassed for simplicity: this use case calls `LocalChat.sendMessage` synchronously after creating the Message. This is acceptable because:
- Widget traffic is low volume
- No ordering guarantee is needed for a single visitor sending messages sequentially

**LocalChat.sendMessage** (`src/app/plugins/chats/LocalChat.ts`):
- Accepts a `messageId`
- Finds the message (with contact populated)
- Finds or creates an open Room for the contact
- Sets `message.room`, `message.sended = true`, saves
- Emits `new-room-message` to the licensee's Socket.IO room

The Message must be created with:
- `number`: a UUID (matches existing MessageRepository.create default)
- `licensee`: the licensee `_id`
- `contact`: the contact `_id`
- `destination`: `'to-chat'`
- `kind`: `'text'`
- `text`: the visitor's message text

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-1/task-01-contact-web-type` status is `complete`
- [ ] Read `src/app/plugins/chats/LocalChat.ts` — understand `sendMessage` signature
- [ ] Read `src/app/plugins/chats/factory.ts` — understand `createChatPlugin` factory
- [ ] Read `src/app/repositories/room.ts` — findOpenForContact signature
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/widget/SendWidgetMessage.ts` | create | Use case implementation |
| `src/app/usecases/widget/SendWidgetMessage.spec.ts` | create | Unit tests |

### Do NOT Modify

- `src/app/plugins/chats/LocalChat.ts` — read-only, called as dependency
- `src/app/usecases/widget/CreateWidgetSession.ts` — owned by task-03
- `src/app/usecases/widget/GetWidgetMessages.ts` — owned by task-05

## Implementation Steps

### Step 1: Create the use case

`src/app/usecases/widget/SendWidgetMessage.ts`:

```ts
import { LocalChat } from '../../plugins/chats/LocalChat'

class SendWidgetMessage {
  licenseeRepository: any
  contactRepository: any
  messageRepository: any
  roomRepository: any

  constructor({ licenseeRepository, contactRepository, messageRepository, roomRepository }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.contactRepository = contactRepository
    this.messageRepository = messageRepository
    this.roomRepository = roomRepository
  }

  async execute({ apiToken, widgetSessionToken, text }: { apiToken: string; widgetSessionToken: string; text: string }) {
    const licensee = await this.licenseeRepository.findFirst({ apiToken })
    if (!licensee) throw new Error(`Licensee not found for token: ${apiToken}`)

    const contact = await this.contactRepository.findFirst({ widgetSessionToken, licensee: licensee._id })
    if (!contact) throw new Error(`Widget session not found: ${widgetSessionToken}`)

    const message = await this.messageRepository.create({
      licensee: licensee._id,
      contact: contact._id,
      destination: 'to-chat',
      kind: 'text',
      text,
    })

    const localChat = new LocalChat(licensee, { roomRepository: this.roomRepository, messageRepository: this.messageRepository })
    await localChat.sendMessage(message._id)

    return message
  }
}

export { SendWidgetMessage }
```

### Step 2: Write specs

`src/app/usecases/widget/SendWidgetMessage.spec.ts`:

- Licensee not found → throws
- Session token not found → throws
- Happy path: creates message + room, emits via LocalChat
  - Mock `LocalChat.prototype.sendMessage` with `jest.spyOn`
  - Verify spy called with the created message's `_id`
- Uses `installMemoryRepositories()` pattern

## Testing

- [ ] 3 spec cases pass
- [ ] `yarn test src/app/usecases/widget/SendWidgetMessage.spec.ts` green
- [ ] `yarn typecheck` passes

## Documentation / KB Updates

No KB/doc updates required.

## Completion Criteria

- [ ] Use case created and specs pass
- [ ] `LocalChat.sendMessage` called with correct message ID
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-03 and task-05 run in parallel — they create sibling files in `src/app/usecases/widget/`. No shared files.
