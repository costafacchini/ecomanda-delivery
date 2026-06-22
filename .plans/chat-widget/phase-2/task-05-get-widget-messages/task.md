# Task: Use Case — GetWidgetMessages

**Plan**: Chat Widget
**Phase**: 2
**Task ID (phase-local)**: task-05
**Task Path**: phase-2/task-05-get-widget-messages
**Depends On**: phase-1/task-02-message-findbyroom
**JIRA**: N/A

## Objective

Implement `GetWidgetMessages` — the use case called by the widget's polling GET request. It returns all messages in the visitor's open room, optionally filtered to only messages newer than a given timestamp (for incremental polling).

## Context

The widget polls `GET /widget/:apiToken/messages?sessionToken=...&since=...` every 5 seconds. This use case:

1. Resolves the licensee from `apiToken`
2. Finds the Contact by `widgetSessionToken`
3. Finds the open Room for that contact
4. Returns messages via `messageRepository.findByRoom(roomId, { since? })` (added in Phase 1, task-02)

The response includes both visitor-originated messages (`destination: 'to-chat'`) and agent replies. Agent replies are stored as Messages in the same room with `destination: 'to-messenger'` and `senderName` set by the agent. The widget uses `fromMe` or `senderName` to distinguish sides.

If no open room exists, returns an empty array — the visitor hasn't sent a first message yet.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-1/task-02-message-findbyroom` status is `complete`
- [ ] Read `src/app/repositories/room.ts` — `findOpenForContact` method
- [ ] Read `src/app/repositories/message.ts` — `findByRoom` method added in task-02
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/widget/GetWidgetMessages.ts` | create | Use case implementation |
| `src/app/usecases/widget/GetWidgetMessages.spec.ts` | create | Unit tests |

### Do NOT Modify

- `src/app/usecases/widget/CreateWidgetSession.ts` — owned by task-03
- `src/app/usecases/widget/SendWidgetMessage.ts` — owned by task-04

## Implementation Steps

### Step 1: Create the use case

`src/app/usecases/widget/GetWidgetMessages.ts`:

```ts
class GetWidgetMessages {
  licenseeRepository: any
  contactRepository: any
  roomRepository: any
  messageRepository: any

  constructor({ licenseeRepository, contactRepository, roomRepository, messageRepository }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.contactRepository = contactRepository
    this.roomRepository = roomRepository
    this.messageRepository = messageRepository
  }

  async execute({
    apiToken,
    widgetSessionToken,
    since,
  }: {
    apiToken: string
    widgetSessionToken: string
    since?: Date
  }) {
    const licensee = await this.licenseeRepository.findFirst({ apiToken })
    if (!licensee) throw new Error(`Licensee not found for token: ${apiToken}`)

    const contact = await this.contactRepository.findFirst({ widgetSessionToken, licensee: licensee._id })
    if (!contact) throw new Error(`Widget session not found: ${widgetSessionToken}`)

    const room = await this.roomRepository.findOpenForContact(contact._id)
    if (!room) return []

    return await this.messageRepository.findByRoom(room._id, { since })
  }
}

export { GetWidgetMessages }
```

### Step 2: Write specs

`src/app/usecases/widget/GetWidgetMessages.spec.ts`:

- Licensee not found → throws
- Session token not found → throws
- No open room → returns empty array
- Happy path with no `since` → returns all room messages
- Happy path with `since` → returns only messages after the timestamp
- Uses `installMemoryRepositories()`

## Testing

- [ ] 5 spec cases pass
- [ ] `yarn test src/app/usecases/widget/GetWidgetMessages.spec.ts` green
- [ ] `yarn typecheck` passes

## Documentation / KB Updates

No KB/doc updates required.

## Completion Criteria

- [ ] Use case created and specs pass
- [ ] Empty array returned when no room exists
- [ ] `since` filter works correctly
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-03 and task-04 run in parallel — sibling files in `src/app/usecases/widget/`. No shared files.
