# Task: MessageRepository — findByRoom query

**Plan**: Chat Widget
**Phase**: 1
**Task ID (phase-local)**: task-02
**Task Path**: phase-1/task-02-message-findbyroom
**Depends On**: None
**JIRA**: N/A

## Objective

Add a `findByRoom(roomId, options?)` method to both `MessageRepositoryDatabase` and `MessageRepositoryMemory`. This method is the data layer for the widget's polling endpoint — it returns messages for a given room, ordered ascending by `createdAt`, optionally filtered to only messages newer than a given timestamp.

## Context

The existing `MessageRepositoryDatabase.find(params)` is a generic `Message.find(params)` with no ordering or date filtering. The widget's `GetWidgetMessages` use case (Phase 2 task-05) needs to efficiently fetch the conversation history and incremental updates.

The method signature:

```ts
findByRoom(roomId: string, options?: { since?: Date }): Promise<Message[]>
```

- Returns messages where `room === roomId`, sorted by `createdAt ASC`
- If `options.since` is provided, adds `createdAt > since` filter
- Both DB and Memory implementations required

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Check `status.md` — must be `not-started` before proceeding
- [ ] Read `src/app/repositories/repository.ts` to understand the base class interface
- [ ] Mark this task `in-progress` in `status.md` before writing code

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/repositories/message.ts` | modify | Add `findByRoom` to both classes |
| `src/app/repositories/message.spec.ts` | modify | Add specs for `findByRoom` |

### Do NOT Modify

- `src/app/models/Contact.ts` — owned by phase-1/task-01-contact-web-type
- `src/app/repositories/contact.ts` — owned by phase-1/task-01-contact-web-type

## Implementation Steps

### Step 1: Add to MessageRepositoryDatabase

```ts
async findByRoom(roomId: any, options: { since?: Date } = {}) {
  const query: Record<string, any> = { room: roomId }
  if (options.since) {
    query.createdAt = { $gt: options.since }
  }
  return await Message.find(query).sort({ createdAt: 1 })
}
```

### Step 2: Add to MessageRepositoryMemory

Use the existing `sortRecords` helper (already imported from `./repository`):

```ts
async findByRoom(roomId: any, options: { since?: Date } = {}) {
  const messages = this.items.filter((m: any) => {
    const roomMatch = comparableValue(m.room) === comparableValue(roomId)
    if (!roomMatch) return false
    if (options.since && m.createdAt) {
      return new Date(m.createdAt) > options.since
    }
    return true
  })
  return sortRecords(messages, { createdAt: 'asc' })
}
```

Import `comparableValue` and `sortRecords` — they are already imported at the top of `message.ts` via the `Repository` import.

### Step 3: Add specs

In `src/app/repositories/message.spec.ts`, cover:
- Returns messages for the given room in ascending `createdAt` order
- Returns empty array when no messages exist for room
- Filters by `since` — only returns messages newer than the given timestamp
- Does not return messages from a different room

## Testing

- [ ] All four cases covered in spec
- [ ] `yarn test src/app/repositories/message.spec.ts` green
- [ ] Existing message repository specs still pass

## Documentation / KB Updates

No KB/doc updates required.

## Completion Criteria

- [ ] `findByRoom` implemented in both DB and Memory classes
- [ ] Specs cover room filter, sort order, and `since` filter
- [ ] No regressions in existing message repository tests
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-01-contact-web-type runs in parallel — no shared files.
