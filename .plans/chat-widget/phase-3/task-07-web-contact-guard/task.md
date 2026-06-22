# Task: SendMessageToMessenger — skip web contacts

**Plan**: Chat Widget
**Phase**: 3
**Task ID (phase-local)**: task-07
**Task Path**: phase-3/task-07-web-contact-guard
**Depends On**: phase-2/task-03-create-widget-session
**JIRA**: N/A

## Objective

Add a guard in `sendMessageToMessenger` so that when the message's contact type is `web`, the function skips the messenger plugin call and marks the message as sent. This prevents a job failure when an agent replies to a widget room (the `chat-message` job routes the reply through LocalChat which returns `action: 'send-message-to-messenger'`, but web contacts have no WhatsApp channel).

## Context

**Current flow for agent replies to a web contact's room**:
1. Agent calls `POST /api/v1/chat/rooms/:roomId/messages` (ChatRoomsController.replyToRoom)
2. `IngestChatMessage.execute` saves body, enqueues `chat-message` BullMQ job
3. `transformChatBody` calls `LocalChat.parseMessage({ roomId, text })` → returns messages + action `'send-message-to-messenger'`
4. Job system dispatches `send-message-to-messenger` job
5. `sendMessageToMessenger` tries to call the WhatsApp messenger plugin → **FAILS** for web contacts (no whatsappDefault plugin)

**Fix**: In `sendMessageToMessenger`, populate `contact` alongside `licensee`, then early-return for `contact.type === 'web'` after marking `message.sended = true`.

**Current `findFirst` call**:
```ts
const message = await messageRepository.findFirst({ _id: messageId }, ['licensee'])
```
Must become:
```ts
const message = await messageRepository.findFirst({ _id: messageId }, ['licensee', 'contact'])
```

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-2/task-03-create-widget-session` status is `complete`
- [ ] Read `src/app/services/SendMessageToMessenger.ts` — current implementation
- [ ] Read `src/app/services/SendMessageToMessenger.spec.ts` — existing tests to preserve
- [ ] Check `src/app/repositories/message.ts` `findFirst` — supports multiple populate values in array
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/services/SendMessageToMessenger.ts` | modify | Add contact populate + web guard |
| `src/app/services/SendMessageToMessenger.spec.ts` | modify | Add spec for web contact guard |

### Do NOT Modify

- `src/app/routes/widget-routes.ts` — owned by task-06
- `src/app/plugins/chats/LocalChat.ts` — not involved in this fix

## Implementation Steps

### Step 1: Update sendMessageToMessenger

```ts
async function sendMessageToMessenger(
  data: any,
  { messageRepository, createMessengerPlugin }: Record<string, any> = {},
) {
  const { messageId, url, token } = data
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee', 'contact'])
  const licensee = message.licensee

  // Web contacts have no messenger channel — mark sent and skip delivery
  if (message.contact?.type === 'web') {
    message.sended = true
    await messageRepository.save(message)
    return
  }

  const extras: any = {}
  if (message.sector) {
    extras.sector = message.sector
  }
  const messengerPlugin = createMessengerPlugin(licensee, extras)
  await messengerPlugin.sendMessage(messageId, url ?? licensee.whatsappUrl, token ?? licensee.whatsappToken)
}
```

### Step 2: Add spec

In `src/app/services/SendMessageToMessenger.spec.ts`, add a new `it` block:

```
it('skips messenger send and marks message as sent when contact type is web', async () => {
  // Create licensee (any whatsappDefault)
  // Create web contact (type: 'web')
  // Create message linked to web contact
  // Call sendMessageToMessenger
  // Assert dialogSendMessageSpy NOT called
  // Assert message.sended is true (reload from repo)
})
```

Use `installMemoryRepositories()` + the existing factory pattern from the file.

## Testing

- [ ] New spec passes: spy not called, message.sended = true
- [ ] Existing 2 specs still pass (no regression on regular contacts)
- [ ] `yarn test src/app/services/SendMessageToMessenger.spec.ts` green
- [ ] `yarn typecheck` passes

## Documentation / KB Updates

No KB/doc updates required.

## Completion Criteria

- [ ] Web contacts skip messenger send without throwing
- [ ] `message.sended` set to `true` for web contact messages
- [ ] Existing messenger specs unaffected
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-06 runs in parallel — it does not touch this service file.
