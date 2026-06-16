# Task: LocalChat — assign sector to new rooms

**Plan**: Local Chat UI
**Phase**: 1
**Task ID (phase-local)**: task-02
**Task Path**: phase-1/task-02-localchat-sector
**Depends On**: None
**JIRA**: N/A

## Objective

Fix `LocalChat.sendMessage` to pass `message.sector` when creating a new room, so that sector-aware room filtering (task-01) has correct data to work with.

## Context

`LocalChat.sendMessage` creates a room when no open room exists for the contact:

```ts
room = await this._roomRepository.create({
  contact: message.contact._id,
  status: 'pending',
  // sector missing — always null today
})
```

The `Room` model already has a `sector (ref Sector, nullable)` field (added in `local-chat-infra`).

The message being processed already carries a `sector` field when it arrived via a sector-specific webhook (implemented in `setores-webhook-providers`). The `findFirst` call that loads the message only populates `contact` — `sector` is an ObjectId on the message document and doesn't need population for this use.

The fix is one line: pass `sector: message.sector ?? null` in the `create` call.

The `findOpenForContact` used to check for existing rooms does NOT filter by sector — this is intentional. A contact can only have one open room at a time regardless of sector; if they switch sectors between sessions, the new room will carry the new sector.

**Key files:**
- `src/app/plugins/chats/LocalChat.ts` — the fix lives here
- `src/app/plugins/chats/LocalChat.spec.ts` — add a test case

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify `status.md` shows `not-started`
- [ ] Read `src/app/plugins/chats/LocalChat.ts` in full
- [ ] Read `src/app/plugins/chats/LocalChat.spec.ts` to understand existing test patterns
- [ ] Read `src/app/models/Room.ts` to confirm `sector` field exists
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/chats/LocalChat.ts` | modify | Pass sector when creating room |
| `src/app/plugins/chats/LocalChat.spec.ts` | modify | Add sector-propagation test case |

### Do NOT Modify

- `src/app/repositories/room.ts` — owned by phase-1/task-01-rooms-api
- `src/app/routes/resources-routes.ts` — owned by phase-1/task-01-rooms-api
- `src/app/models/Room.ts` — schema is stable; read-only

## Implementation Steps

### Step 1: Fix `LocalChat.sendMessage`

In `src/app/plugins/chats/LocalChat.ts`, update the room creation block:

```ts
if (!room) {
  room = await this._roomRepository.create({
    contact: message.contact._id,
    status: 'pending',
    sector: message.sector ?? null,
  })
}
```

No other changes needed. The `message` object already has `sector` as an ObjectId or null (it is a raw field on the document, not a populated relation — no extra populate call required).

### Step 2: Update `LocalChat.spec.ts`

Add two test cases to the `sendMessage` describe block:

**"creates a room with the message's sector when no open room exists"**
- Setup: message with a `sector` ObjectId, no existing open room
- Assert: `roomRepository.create` is called with `sector` equal to the message's sector

**"creates a room with sector null when message has no sector"**
- Setup: message without `sector`, no existing open room
- Assert: `roomRepository.create` is called with `sector: null`

The existing test patterns in `LocalChat.spec.ts` use the Memory repository variants — follow the same approach.

## Testing

- [ ] New `sendMessage` specs pass (sector propagated / sector null)
- [ ] All existing `LocalChat.spec.ts` tests still pass
- [ ] `npx jest` — all backend tests pass
- [ ] `npx eslint .` — no new errors

## Documentation / KB Updates

- [ ] No KB/doc updates required — the change is a one-line bugfix with a targeted spec.

## Completion Criteria

- [ ] `LocalChat.sendMessage` passes `sector` (or `null`) when creating a new room
- [ ] Two new test cases cover the sector propagation behaviour
- [ ] All backend tests pass
- [ ] Lint clean
- [ ] Status updated to `complete` in `status.md`
- [ ] Changes committed to `plan/local-chat-ui/phase-1/task-02-localchat-sector`

## Conflict Avoidance Notes

Parallel task in Phase 1: `phase-1/task-01-rooms-api` owns `src/app/repositories/room.ts` and `src/app/routes/resources-routes.ts` — do not touch those files.
