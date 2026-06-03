# Task: App boot wiring + QR integration

**Plan**: Baileys Socket Monitor
**Phase**: 3
**Task ID (phase-local)**: task-04
**Task Path**: phase-3/task-04-boot-and-qr-integration
**Depends On**: phase-2/task-03-start-socket-usecase
**JIRA**: N/A

## Objective

Wire the persistent socket system into the app lifecycle: start all active Baileys sessions at server boot (gated by `ENABLE_BAILEYS_SOCKET=true`), trigger a socket start after a successful QR pairing, and update the KB doc.

## Context

After phase 2 we have a working `startBaileysSocket(licensee)` function in the runtime dependency graph.

This task connects it to two trigger points:

**1. App boot (`server.ts`)**: After the DB connection is established, load all licensees with `whatsappDefault === 'baileys'` and a non-empty session (active credentials), then call `startBaileysSocket` for each. Fire-and-forget (don't block `server.listen`). Gate the entire boot routine behind `ENABLE_BAILEYS_SOCKET=true` to allow gradual rollout.

**2. Post-QR pairing (`GetBaileysQr.ts`)**: `getQrCode()` in `Baileys.ts` currently resolves with `null` when the QR is scanned and the connection opens. After this task, `GetBaileysQr.execute()` calls `startBaileysSocket(licensee)` when `getQrCode()` returns `null` (already connected) or after the QR is resolved (connection opened). This ensures a persistent socket is started without requiring a restart.

Boot use case (`BootBaileysSocketSessions`): Encapsulates the "find all active Baileys licensees → start sockets" logic so it is testable independently from the server entry point.

An "active session" is a licensee where:
- `whatsappDefault === 'baileys'`
- A `WhatsappSession` record exists with non-empty `creds`

The boot routine should log each start attempt and swallow per-licensee errors (a bad session should not prevent other licensees from starting).

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/baileys-socket-monitor/phase-3/task-04-boot-and-qr-integration`
- [ ] Verify `phase-2/task-03-start-socket-usecase/status.md` shows `complete`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Read `server.ts` (top-level)
- [ ] Read `src/config/http.ts` and `src/config/mongo.ts` to understand the boot sequence
- [ ] Read `src/app/usecases/licensees/GetBaileysQr.ts`
- [ ] Read `src/app/runtime/dependencies.ts` (understand what's now available after task-03)
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/licensees/BootBaileysSocketSessions.ts` | create | Boot use case |
| `src/app/usecases/licensees/BootBaileysSocketSessions.spec.ts` | create | Unit tests |
| `src/app/usecases/licensees/GetBaileysQr.ts` | modify | Trigger socket after QR pairing |
| `src/app/usecases/licensees/GetBaileysQr.spec.ts` | modify | Add socket trigger test |
| `src/app/runtime/dependencies.ts` | modify | Wire `bootBaileysSocketSessions` |
| `server.ts` | modify | Call boot routine after DB connects |
| `docs/kb/features/baileys-whatsapp-guide.md` | modify | Document persistent socket section |

### Do NOT Modify

- `src/app/services/BaileysSocketManager.ts` — complete (phase 1)
- `src/app/plugins/messengers/Baileys.ts` — complete (phase 1)
- `src/app/usecases/licensees/StartBaileysSocket.ts` — complete (phase 2)

## Implementation Steps

### Step 1: Create `BootBaileysSocketSessions` use case

```ts
// src/app/usecases/licensees/BootBaileysSocketSessions.ts
import { logger } from '../../helpers/logger'

class BootBaileysSocketSessions {
  licenseeRepository: any
  whatsappSessionRepository: any
  startBaileysSocket: any

  constructor({ licenseeRepository, whatsappSessionRepository, startBaileysSocket }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.whatsappSessionRepository = whatsappSessionRepository
    this.startBaileysSocket = startBaileysSocket
  }

  async execute() {
    const licensees = await this.licenseeRepository.find({ whatsappDefault: 'baileys' })

    for (const licensee of licensees) {
      try {
        const session = await this.whatsappSessionRepository.findFirst({ licensee: licensee._id })
        if (!session?.creds || Object.keys(session.creds).length === 0) {
          logger.info(`Baileys boot: licensee ${licensee._id} sem sessão ativa, ignorando.`)
          continue
        }
        logger.info(`Baileys boot: iniciando socket para licensee ${licensee._id}`)
        await this.startBaileysSocket(licensee)
      } catch (err: any) {
        logger.error(`Baileys boot: falha ao iniciar socket para licensee ${licensee._id}: ${err.message ?? err}`)
      }
    }
  }
}

export { BootBaileysSocketSessions }
```

### Step 2: Wire `bootBaileysSocketSessions` in `dependencies.ts`

1. Import `BootBaileysSocketSessions`.
2. Inside `buildRuntimeDependencies`, after `startBaileysSocket`:
   ```js
   const bootBaileysSocketSessions = () =>
     new BootBaileysSocketSessions({
       licenseeRepository,
       whatsappSessionRepository,
       startBaileysSocket,
     }).execute()
   ```
3. Add to the returned object.

### Step 3: Add boot hook to `server.ts`

After `server.listen(PORT)`, add a fire-and-forget boot call gated by the env flag:

```js
if (process.env.ENABLE_BAILEYS_SOCKET === 'true') {
  import('./src/app/runtime/dependencies').then(({ createRuntimeDependencies }) => {
    const { bootBaileysSocketSessions } = createRuntimeDependencies()
    bootBaileysSocketSessions().catch((err) => {
      console.error('Baileys boot: erro ao iniciar sockets', err)
    })
  })
}
```

Use a dynamic import to avoid the `createRuntimeDependencies` call from affecting non-Baileys server starts.

### Step 4: Update `GetBaileysQr.ts`

Add `startBaileysSocket` as a constructor dependency and call it after QR resolution:

```ts
class GetBaileysQr {
  licenseeRepository: any
  createMessengerPlugin: any
  startBaileysSocket: any

  constructor({ licenseeRepository, createMessengerPlugin, startBaileysSocket }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.createMessengerPlugin = createMessengerPlugin
    this.startBaileysSocket = startBaileysSocket
  }

  async execute(id: any) {
    const licensee = await this.licenseeRepository.findFirst({ _id: id })

    if (licensee.whatsappDefault !== 'baileys') {
      return { message: 'Licensee não usa Baileys' }
    }

    const plugin = this.createMessengerPlugin(licensee)
    const qr = await plugin.getQrCode()

    if (!qr) {
      // Already connected — ensure persistent socket is running
      if (process.env.ENABLE_BAILEYS_SOCKET === 'true') {
        this.startBaileysSocket?.(licensee).catch(() => {})
      }
      return { message: 'Já conectado' }
    }

    // QR returned — the QR flow will trigger a connection.update → 'open' event.
    // Start socket after pairing succeeds (fire-and-forget; the Baileys socket manager
    // handles duplicate start calls gracefully via the registry check).
    if (process.env.ENABLE_BAILEYS_SOCKET === 'true') {
      this.startBaileysSocket?.(licensee).catch(() => {})
    }

    return { qr }
  }
}
```

Wire `startBaileysSocket` in `createGetBaileysQr` factory or wherever `GetBaileysQr` is instantiated (check the controller or routes that call it).

> **Note**: Duplicate `start()` calls are safe if `BaileysSocketManager` checks `isConnected()` at the top of `start()` and returns early if the socket is already in the registry. Verify task-01 implements this guard; if not, add it.

### Step 5: Update `baileys-whatsapp-guide.md`

Add a new section **"Step 6 — Persistent Socket Monitor"** covering:
- What `ENABLE_BAILEYS_SOCKET=true` enables
- What events are captured (`messages.upsert` inbound, `messages.update` receipts)
- Boot behavior (all active sessions start at server start)
- Post-QR behavior (socket starts automatically after pairing)
- How inbound messages reach the DB (same `Body → messenger-message` job pipeline)
- How delivery receipts update `Message.sendedAt / deliveredAt / readAt`
- Note that the HTTP webhook endpoint (`POST /v1/messenger/message`) still works as a fallback
- Manual verification checklist (see Success Criteria in overview.md)

## Testing

- [ ] `BootBaileysSocketSessions.execute()` — calls `startBaileysSocket` for each licensee with non-empty session creds
- [ ] `BootBaileysSocketSessions.execute()` — skips licensees with empty/missing creds
- [ ] `BootBaileysSocketSessions.execute()` — logs error and continues if `startBaileysSocket` throws for one licensee
- [ ] `GetBaileysQr.execute()` — calls `startBaileysSocket` when `ENABLE_BAILEYS_SOCKET === 'true'` and QR is generated
- [ ] `GetBaileysQr.execute()` — calls `startBaileysSocket` when `ENABLE_BAILEYS_SOCKET === 'true'` and already connected
- [ ] `GetBaileysQr.execute()` — does NOT call `startBaileysSocket` when `ENABLE_BAILEYS_SOCKET` is not set
- [ ] All existing `GetBaileysQr.spec.ts` tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Update `docs/kb/features/baileys-whatsapp-guide.md` with Step 6 (persistent socket section)
- [ ] Run `check-kb-index` after KB changes

## Completion Criteria

- [ ] `BootBaileysSocketSessions` created and wired
- [ ] `GetBaileysQr` triggers socket start after pairing
- [ ] `server.ts` boots all active sessions when `ENABLE_BAILEYS_SOCKET=true`
- [ ] All unit tests pass: `npx jest`
- [ ] `npx eslint .` produces no new errors
- [ ] `baileys-whatsapp-guide.md` updated with persistent socket section
- [ ] `check-kb-index` run after KB update
- [ ] Changes committed to `plan/baileys-socket-monitor/phase-3/task-04-boot-and-qr-integration` branch
- [ ] Status updated to `complete` in `status.md`
- [ ] All items in the plan's Success Criteria checked off

## Conflict Avoidance Notes

None — this phase has only one task.
