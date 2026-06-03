# Task: Message routing + agent access filtering

**Plan**: Setores
**Phase**: 2
**Task ID (phase-local)**: task-04
**Task Path**: phase-2/task-04-message-routing
**Depends On**: phase-1/task-01-setor-model-api, phase-1/task-02-schema-migrations
**JIRA**: N/A

## Objective

When a message arrives on a sector socket, attach the sector to the Room. Ensure agents only see rooms and messages belonging to their sector(s). Messages on the main licensee number (no sector) remain visible to all agents.

## Context

**Routing logic:**

The `StartBaileysSocket` use case (task-03) passes `setor` in the `onMessage` callback closure. This task wires that through so the Room created during message ingestion carries the sector reference.

The current ingest flow:
```
onMessage(msg) → IngestMessengerMessage → Body → messenger-message job
  → transformMessengerBody → responseToMessages → Room created (no setor today)
```

For sectors, the `setor` context needs to reach `responseToMessages` so the Room is created with `room.setor = setorId`. The cleanest approach without changing `IngestMessengerMessage` signature: **include `setorId` in the message body** passed to `IngestMessengerMessage.execute()`, then extract it in `transformMessengerBody` before calling `responseToMessages`.

Alternative: add a `setorId` field to the `Body` model. This keeps the setor context in the DB-persisted payload rather than in the in-memory message, which is more reliable for retry scenarios.

**Recommended approach:** Add `setorId` to `Body` content (as part of the raw body saved to MongoDB), extract it in `transformMessengerBody`, and pass it through to `responseToMessages` → Room creation.

**Access filtering:**

When an agent (`role: 'agent'` or `'supervisor'`) queries rooms/messages, the repository layer applies a filter:
- If `licensee.useSetores === true` AND user has sector memberships: filter rooms where `room.setor IN user.setores`
- If user is `admin` or `super`: no sector filter applied
- If `licensee.useSetores === false`: no sector filter applied (all agents see all)

The filtering happens at the repository/use case level, not the controller level, to prevent accidental bypass.

Read `src/app/usecases/webhooks/IngestMessengerMessage.ts` and `src/app/services/MessengerMessage.ts` (`transformMessengerBody`) before implementing.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/setores/phase-2/task-04-message-routing`
- [ ] Verify `phase-1/task-01-setor-model-api/status.md` shows `complete`
- [ ] Verify `phase-1/task-02-schema-migrations/status.md` shows `complete`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Read `src/app/usecases/webhooks/IngestMessengerMessage.ts`
- [ ] Read `src/app/services/MessengerMessage.ts` (`transformMessengerBody`)
- [ ] Read `src/app/plugins/chats/Base.ts` (Room creation in `responseToMessages`)
- [ ] Read `src/app/models/Body.ts` (check schema for adding `setorId`)
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/webhooks/IngestMessengerMessage.ts` | modify | Accept optional `setorId` in execute(); save to Body |
| `src/app/services/MessengerMessage.ts` | modify | Extract `setorId` from body; pass to responseToMessages |
| `src/app/plugins/messengers/Base.ts` | modify | Pass `setorId` through to Room creation |
| `src/app/usecases/licensees/StartBaileysSocket.ts` | modify | Pass `setor._id` in `onMessage` call to IngestMessengerMessage |
| `src/app/repositories/room.ts` | modify | Add `findByAgent` query supporting sector filter |

### Do NOT Modify

- `src/app/services/BaileysSocketManager.ts` — owned by phase-2/task-03 (complete)
- `src/app/models/Room.ts` — complete (phase 1)
- `src/app/models/Setor.ts` — complete (phase 1)

## Implementation Steps

### Step 1: Update `IngestMessengerMessage.execute()`

Add optional `setorId` to the execute payload and include it when saving the Body:

```ts
async execute({ body, licenseeId, setorId = null }: { body: any; licenseeId: any; setorId?: any } = {} as any) {
  const bodySaved = await this.messengerRepository.create({
    content: body,
    licensee: licenseeId,
    kind: MESSENGER_MESSAGE_KIND,
    setor: setorId,   // null for main licensee number
  })
  ...
}
```

Check `src/app/models/Body.ts` — if `setor` field doesn't exist, add it as a nullable ObjectId.

### Step 2: Update `transformMessengerBody` in `MessengerMessage.ts`

Extract `body.setor` and pass to `responseToMessages`:
```ts
const setorId = body.setor ?? null
const messages = await messengerPlugin.responseToMessages(body.content, { setorId })
```

### Step 3: Update `MessengersBase.responseToMessages()` in `Base.ts`

Add `options = {}` parameter, extract `setorId`, and pass when creating the Room (in `LocalChat.sendMessage()` / or wherever Room is created — depends on `local-chat-infra` plan). For this task, at minimum pass `setorId` through so it's available when Room creation happens.

### Step 4: Update `StartBaileysSocket` to pass `setorId`

```ts
onMessage: async (msg: any) => {
  await this.ingestMessengerMessage.execute({
    body: msg,
    licenseeId: licensee._id,
    setorId: setor?._id ?? null,
  })
},
```

### Step 5: Agent access filtering in `room.ts` repository

Add a `findForAgent(userId, licenseeId, setorIds)` query:
```ts
// If setorIds is non-empty array: filter rooms where room.setor IN setorIds
// If setorIds is null/empty: return all rooms for licensee (admin/super/sectors disabled)
```

This method is called from use cases that list rooms for agents in the `local-chat-infra` plan. Wire it up so the filter is applied based on the current user's sector memberships.

## Testing

- [ ] `IngestMessengerMessage.execute()` with `setorId` — Body is saved with `setor` populated
- [ ] `IngestMessengerMessage.execute()` without `setorId` — Body is saved with `setor: null` (no regression)
- [ ] `transformMessengerBody` — extracts `setor` from body and passes to `responseToMessages`
- [ ] `StartBaileysSocket.onMessage` — passes `setor._id` when setor is present
- [ ] `StartBaileysSocket.onMessage` — passes `null` when setor is absent (main number)
- [ ] Room repository `findForAgent` — returns only sector rooms when `setorIds` provided
- [ ] Room repository `findForAgent` — returns all rooms when `setorIds` is empty (admin)
- [ ] All existing `IngestMessengerMessage` tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc updates required at this task

## Completion Criteria

- [ ] `setorId` flows from socket event → Body → Room
- [ ] Agent access filtering implemented at repository level
- [ ] All tests pass
- [ ] Changes committed to `plan/setores/phase-2/task-04-message-routing` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-03 modifies `StartBaileysSocket` to accept `setor`. This task also modifies it to pass `setorId` in `onMessage`. Since task-03 runs in the same phase (parallel), coordinate via the branch merge order: task-04 should base its `StartBaileysSocket` changes on task-03's version. If running in parallel, stub the `setor` pass-through and reconcile at merge time.
