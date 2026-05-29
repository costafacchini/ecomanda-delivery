# Task: parseMessageStatus implementation

**Plan**: Baileys Socket Monitor
**Phase**: 1
**Task ID (phase-local)**: task-02
**Task Path**: phase-1/task-02-receipt-parsing
**Depends On**: None
**JIRA**: N/A

## Objective

Implement the `parseMessageStatus` stub in `Baileys.js` so that `messages.update` socket events can update `sendedAt`, `deliveredAt`, and `readAt` on existing `Message` records via the existing `Base.js` receipt path.

## Context

`Baileys.js:30-34` has a stub:
```js
parseMessageStatus(_body) {
  // Baileys delivery receipts are not received via HTTP webhook body in the same shape.
  // For now, no status parsing is needed from incoming HTTP payloads.
  this.messageStatus = null
}
```

`Base.js:74-91` already handles `messageStatus` correctly when it's not null:
```js
if (this.messageStatus) {
  const message = await this.messageRepository.findFirst({ licensee, messageWaId: this.messageStatus.id })
  if (message) {
    if (this.messageStatus.status === 'sent') message.sendedAt = new Date()
    if (this.messageStatus.status === 'delivered') message.deliveredAt = new Date()
    if (this.messageStatus.status === 'read') message.readAt = new Date()
    await this.messageRepository.save(message)
  }
  return []
}
```

The `messages.update` event from Baileys delivers an array of updates with this shape (one entry per update):
```js
{
  key: { id: string, fromMe: boolean, remoteJid: string },
  update: { status: number }  // Baileys MessageStatus enum
}
```

Baileys `MessageStatus` enum values (from `@whiskeysockets/baileys`):
- `1` → `SERVER_ACK` → map to `'sent'`
- `2` → `DELIVERY_ACK` → map to `'delivered'`
- `3` → `READ` → map to `'read'`
- `4` → `PLAYED` → map to `'read'` (audio played counts as read)

Only `fromMe: true` updates are relevant for receipt tracking (we're tracking our own outbound messages).

The `BaileysSocketManager` (task-01) calls `onReceiptUpdate(update)` for each update in `messages.update`. The `StartBaileysSocket` use case (task-03) will wire this callback to call `messengerPlugin.responseToMessages(update)`, which in turn calls `parseMessageStatus(update)`. This task makes that path work.

The `body` passed to `parseMessageStatus` from the socket manager will be a single update entry (not the full array), shaped as above.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/baileys-socket-monitor/phase-1/task-02-receipt-parsing`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Read `src/app/plugins/messengers/Baileys.js` in full
- [ ] Read `src/app/plugins/messengers/Base.js:74-91` (receipt handling path)
- [ ] Read existing `Baileys.spec.js` to understand test patterns
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/messengers/Baileys.js` | modify | Implement `parseMessageStatus` |
| `src/app/plugins/messengers/Baileys.spec.js` | modify | Add receipt parsing tests |

### Do NOT Modify

- `src/app/services/BaileysSocketManager.js` — owned by phase-1/task-01-socket-manager
- `src/app/plugins/messengers/Base.js` — shared, read-only
- `src/app/runtime/dependencies.js` — owned by phase-2/task-03-start-socket-usecase

## Implementation Steps

### Step 1: Replace the `parseMessageStatus` stub in `Baileys.js`

Replace the stub with an implementation that maps the Baileys update shape to the `messageStatus` object expected by `Base.js`:

```js
parseMessageStatus(body) {
  if (!body?.key?.id || !body?.key?.fromMe || body.update?.status == null) {
    this.messageStatus = null
    return
  }

  const statusMap = {
    1: 'sent',       // SERVER_ACK
    2: 'delivered',  // DELIVERY_ACK
    3: 'read',       // READ
    4: 'read',       // PLAYED (audio)
  }

  const mapped = statusMap[body.update.status]
  if (!mapped) {
    this.messageStatus = null
    return
  }

  this.messageStatus = {
    id: body.key.id,
    status: mapped,
  }
}
```

### Step 2: Remove the stale comment

Remove the comment inside the stub that says "Baileys delivery receipts are not received via HTTP webhook body in the same shape." — that is no longer accurate once the socket delivers them natively.

## Testing

- [ ] `parseMessageStatus` with `status: 1` (SERVER_ACK) sets `messageStatus.status = 'sent'`
- [ ] `parseMessageStatus` with `status: 2` (DELIVERY_ACK) sets `messageStatus.status = 'delivered'`
- [ ] `parseMessageStatus` with `status: 3` (READ) sets `messageStatus.status = 'read'`
- [ ] `parseMessageStatus` with `status: 4` (PLAYED) sets `messageStatus.status = 'read'`
- [ ] `parseMessageStatus` with `fromMe: false` sets `messageStatus = null` (not a receipt for our messages)
- [ ] `parseMessageStatus` with null/missing body sets `messageStatus = null`
- [ ] `parseMessageStatus` with unknown status code sets `messageStatus = null`
- [ ] All existing `Baileys.spec.js` tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc updates required at this task — the feature is documented as a whole in phase-3/task-04-boot-and-qr-integration

## Completion Criteria

- [ ] `parseMessageStatus` implemented as described
- [ ] All new and existing tests pass: `npx jest src/app/plugins/messengers/Baileys.spec.js`
- [ ] `npx eslint src/app/plugins/messengers/` passes
- [ ] Changes committed to `plan/baileys-socket-monitor/phase-1/task-02-receipt-parsing` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-01 (socket-manager) creates a new file only — no conflict with `Baileys.js`.
