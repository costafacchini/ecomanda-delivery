# Task: StartBaileysSocket use case

**Plan**: Baileys Socket Monitor
**Phase**: 2
**Task ID (phase-local)**: task-03
**Task Path**: phase-2/task-03-start-socket-usecase
**Depends On**: phase-1/task-01-socket-manager, phase-1/task-02-receipt-parsing
**JIRA**: N/A

## Objective

Create the `StartBaileysSocket` use case that wires `BaileysSocketManager.start()` to the app's message pipeline, and add it plus the socket manager to the runtime dependency graph.

## Context

After phase 1 we have:
- `BaileysSocketManager` — knows how to manage socket lifecycle and fires `onMessage(msg)` and `onReceiptUpdate(update)` callbacks.
- `Baileys.parseMessageStatus` — can now parse a `messages.update` entry into the `messageStatus` shape consumed by `Base.responseToMessages`.

This task is the glue layer:

**`onMessage(msg)` callback** → calls `IngestMessengerMessage.execute({ body: msg, licenseeId })`. This routes the inbound message through the existing `Body` → `messenger-message` BullMQ job → `transformMessengerBody` → `Baileys.responseToMessages` pipeline with no changes to those layers.

**`onReceiptUpdate(update)` callback** → calls `messengerPlugin.responseToMessages(update)`. Since `parseMessageStatus` (task-02) now returns a non-null `messageStatus` for valid receipt updates, `Base.responseToMessages` takes the early-return receipt path and updates `sendedAt`/`deliveredAt`/`readAt` on the Message record.

`onLogout` callback → log a warning that the licensee's session was invalidated. No further action at this layer (the socket manager already cleared credentials).

See `src/app/usecases/webhooks/IngestMessengerMessage.ts` for the ingest use case signature and `src/app/runtime/dependencies.ts` for how use cases and factories are assembled.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/baileys-socket-monitor/phase-2/task-03-start-socket-usecase`
- [ ] Verify `phase-1/task-01-socket-manager/status.md` shows `complete`
- [ ] Verify `phase-1/task-02-receipt-parsing/status.md` shows `complete`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Read `src/app/usecases/webhooks/IngestMessengerMessage.ts`
- [ ] Read `src/app/runtime/dependencies.ts` (full file — understand how use cases are wired)
- [ ] Read `src/app/services/BaileysSocketManager.ts` (created in task-01)
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/licensees/StartBaileysSocket.ts` | create | Use case |
| `src/app/usecases/licensees/StartBaileysSocket.spec.ts` | create | Unit tests |
| `src/app/runtime/dependencies.ts` | modify | Wire `socketManager`, `startBaileysSocket` |

### Do NOT Modify

- `src/app/services/BaileysSocketManager.ts` — owned by phase-1/task-01-socket-manager (complete)
- `src/app/plugins/messengers/Baileys.ts` — owned by phase-1/task-02-receipt-parsing (complete)
- `src/app/usecases/webhooks/IngestMessengerMessage.ts` — read-only
- `server.ts` — owned by phase-3/task-04-boot-and-qr-integration
- `src/app/usecases/licensees/GetBaileysQr.ts` — owned by phase-3/task-04-boot-and-qr-integration

## Implementation Steps

### Step 1: Create `StartBaileysSocket` use case

```ts
// src/app/usecases/licensees/StartBaileysSocket.ts
import { logger } from '../../helpers/logger'

class StartBaileysSocket {
  socketManager: any
  createMessengerPlugin: any
  ingestMessengerMessage: any

  constructor({ socketManager, createMessengerPlugin, ingestMessengerMessage }: Record<string, any> = {}) {
    this.socketManager = socketManager
    this.createMessengerPlugin = createMessengerPlugin
    this.ingestMessengerMessage = ingestMessengerMessage
  }

  async execute(licensee: any) {
    const plugin = this.createMessengerPlugin(licensee)

    await this.socketManager.start(licensee, {
      onMessage: async (msg: any) => {
        await this.ingestMessengerMessage.execute({
          body: msg,
          licenseeId: licensee._id,
        })
      },
      onReceiptUpdate: async (update: any) => {
        await plugin.responseToMessages(update)
      },
      onLogout: () => {
        logger.warn(`Baileys: sessão do licensee ${licensee._id} foi desconectada (logout).`)
      },
    })
  }
}

export { StartBaileysSocket }
```

### Step 2: Add `socketManager` singleton to `dependencies.ts`

In `src/app/runtime/dependencies.ts`:

1. Import `BaileysSocketManager` and `StartBaileysSocket`.
2. Inside `buildRuntimeDependencies`, create the singleton:
   ```js
   const socketManager = new BaileysSocketManager({ whatsappSessionRepository })
   ```
3. Create the factory / instance:
   ```js
   const startBaileysSocket = (licensee) =>
     new StartBaileysSocket({
       socketManager,
       createMessengerPlugin,
       ingestMessengerMessage: new IngestMessengerMessage({
         messengerRepository: bodyRepository,
         jobQueue: queueServer,
       }),
     }).execute(licensee)
   ```
4. Add `socketManager` and `startBaileysSocket` to the returned dependency object.

> `queueServer` is already imported in `queue.ts` — `dependencies.ts` should import it from `../../config/queue` (already available via the existing pattern if it isn't already imported). Verify before adding a new import.

### Step 3: Ensure `IngestMessengerMessage` is importable in `dependencies.ts`

Check if it is already imported. If not, add:
```ts
import { IngestMessengerMessage } from '../usecases/webhooks/IngestMessengerMessage'
```

## Testing

- [ ] `StartBaileysSocket.execute(licensee)` calls `socketManager.start` with correct callbacks
- [ ] `onMessage` callback calls `ingestMessengerMessage.execute` with `{ body: msg, licenseeId }`
- [ ] `onReceiptUpdate` callback calls `plugin.responseToMessages` with the update
- [ ] `onLogout` logs a warning (mock `logger` and assert)
- [ ] All existing tests in `src/app/usecases/` still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc updates required at this task — the feature is documented as a whole in phase-3/task-04-boot-and-qr-integration

## Completion Criteria

- [ ] `StartBaileysSocket` created and wired in `dependencies.ts`
- [ ] All unit tests pass: `npx jest src/app/usecases/licensees/StartBaileysSocket.spec.ts`
- [ ] `npx eslint src/app/usecases/licensees/ src/app/runtime/` passes
- [ ] Changes committed to `plan/baileys-socket-monitor/phase-2/task-03-start-socket-usecase` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

None — this phase has only one task.
