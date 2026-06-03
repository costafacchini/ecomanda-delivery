# Task: BaileysSocketManager service

**Plan**: Baileys Socket Monitor
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-socket-manager
**Depends On**: None
**JIRA**: N/A

## Objective

Create `src/app/services/BaileysSocketManager.ts` — a per-licensee persistent Baileys WebSocket registry that opens a socket, keeps it alive with reconnect logic, and fires caller-supplied callbacks for inbound messages and delivery receipt events.

## Context

The current `Baileys.ts` plugin opens a socket on-demand and closes it after each operation (send, QR, fetchGroups). There is no long-lived socket, so incoming `messages.upsert` and `messages.update` events are never captured natively.

`BaileysSocketManager` is the low-level service responsible only for socket lifecycle. It does NOT know about the app's message pipeline — it accepts callbacks (`onMessage`, `onReceiptUpdate`) at start time so callers can inject their own routing logic without coupling this service to use cases.

Key patterns to follow from `Baileys.ts`:
- `_openSocket(session, state, rawKeys, BufferJSON)` — socket bootstrap including `creds.update` persistence. Reuse the auth state build pattern.
- `buildAuthState(session, initAuthCreds, BufferJSON)` — deserialize MongoDB-stored creds/keys back to Buffers.
- `saveSession(session, creds, keys, BufferJSON)` — persist updated credentials.
- These methods are on the `Baileys` class (which extends `MessengersBase`). `BaileysSocketManager` is a standalone service — it should accept a `whatsappSessionRepository` and a `Baileys` plugin factory (or the auth helpers directly) rather than extending the plugin class.

Reconnect logic: Baileys fires `connection.update` with `connection === 'close'` and `lastDisconnect.error` containing a `DisconnectReason` code. The standard reconnect approach:
- `DisconnectReason.loggedOut` (401) — do NOT reconnect; clear credentials, emit a `onLogout` callback.
- Any other close reason — reconnect after a jittered backoff (start with 2s, cap at 30s).

The socket registry is a `Map<string, { socket, licensee }>` keyed by `licenseeId.toString()`.

Read `docs/kb/architecture/job-queue-system.md` for context on how the job pipeline works (the `onMessage` callback will eventually enqueue a `messenger-message` job).

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/baileys-socket-monitor/phase-1/task-01-socket-manager`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Read `src/app/plugins/messengers/Baileys.ts` (full file — especially `_openSocket`, `buildAuthState`, `saveSession`, `_waitForConnection`)
- [ ] Read `docs/kb/architecture/job-queue-system.md`
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/services/BaileysSocketManager.ts` | create | Core service |
| `src/app/services/BaileysSocketManager.spec.ts` | create | Unit tests |

### Do NOT Modify

- `src/app/plugins/messengers/Baileys.ts` — owned by phase-1/task-02-receipt-parsing
- `src/app/runtime/dependencies.ts` — owned by phase-2/task-03-start-socket-usecase
- `src/app/usecases/licensees/GetBaileysQr.ts` — owned by phase-3/task-04-boot-and-qr-integration
- `server.ts` — owned by phase-3/task-04-boot-and-qr-integration

## Implementation Steps

### Step 1: Create `BaileysSocketManager`

```ts
// src/app/services/BaileysSocketManager.ts
class BaileysSocketManager {
  private _whatsappSessionRepository: any
  private _sockets: Map<string, { socket: any; licensee: any }>

  constructor({ whatsappSessionRepository }: Record<string, any> = {}) {
    this._whatsappSessionRepository = whatsappSessionRepository
    this._sockets = new Map() // licenseeId (string) → { socket, licensee }
  }

  isConnected(licenseeId: any): boolean { ... }

  async start(licensee: any, { onMessage, onReceiptUpdate, onLogout }: Record<string, any> = {}): Promise<void> { ... }

  stop(licenseeId: any): void { ... }

  _scheduleReconnect(licensee: any, callbacks: any, delayMs: number): void { ... }
}

export { BaileysSocketManager }
```

### Step 2: Implement `start(licensee, callbacks)`

1. Load/create the `WhatsappSession` for this licensee (same as `Baileys.prototype.loadOrCreateSession`).
2. Import `@whiskeysockets/baileys` dynamically: `initAuthCreds`, `BufferJSON`, `fetchLatestBaileysVersion`, `makeWASocket`, `Browsers`, `DisconnectReason`.
3. Build auth state via `buildAuthState` logic (inline or via a shared helper — do NOT call into the Baileys plugin class).
4. Call `makeWASocket({ version, auth: state, printQRInTerminal: false, browser: Browsers.ubuntu('Chrome') })`.
5. Register `creds.update` → persist session.
6. Register `connection.update`:
   - `connection === 'open'` → store socket in `_sockets`, log info.
   - `connection === 'close'` → remove from `_sockets`; if `DisconnectReason.loggedOut`, clear creds and call `onLogout?.()`, otherwise `_scheduleReconnect`.
7. Register `messages.upsert`:
   - Only process `type === 'notify'` events.
   - For each `msg` where `!msg.key.fromMe`: call `onMessage?.(msg)`.
8. Register `messages.update`:
   - For each update: call `onReceiptUpdate?.(update)`.

### Step 3: Implement `stop(licenseeId)`

Call `socket.end()` and delete from `_sockets`. Guard against double-stop (socket may already be closed).

### Step 4: Implement reconnect with jitter

```ts
_scheduleReconnect(licensee: any, callbacks: any, delayMs = 2000): void {
  const jitter = Math.random() * 1000
  const nextDelay = Math.min(delayMs * 2, 30000)
  setTimeout(() => {
    this.start(licensee, { ...callbacks, reconnectDelay: nextDelay })
  }, delayMs + jitter)
}
```

Pass `reconnectDelay` through so `start` feeds it back to `_scheduleReconnect` on subsequent failures.

### Step 5: Auth state helpers

Inline the `buildAuthState` and `saveSession` logic from `Baileys.ts` (copy, don't import from the plugin class — the service has no plugin dependency). This is a deliberate duplication to keep the service self-contained; if a shared utility is later extracted, that is a separate refactor.

## Testing

- [ ] `start()` — when `messages.upsert` fires with `type: 'notify'` and `fromMe: false`, `onMessage` callback is called with the message
- [ ] `start()` — when `messages.upsert` fires with `fromMe: true` (self-sent), `onMessage` is NOT called
- [ ] `start()` — when `messages.update` fires, `onReceiptUpdate` is called
- [ ] `connection.update` with `connection: 'close'` and non-logout error triggers `_scheduleReconnect`
- [ ] `connection.update` with `DisconnectReason.loggedOut` clears credentials and calls `onLogout`
- [ ] `stop()` calls `socket.end()` and removes from registry
- [ ] `isConnected()` returns `true` only when socket is in registry
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc updates required at this task — the persistent socket feature is documented as a whole in phase-3/task-04-boot-and-qr-integration

## Completion Criteria

- [ ] `BaileysSocketManager` created with `start`, `stop`, `isConnected`, reconnect logic
- [ ] All unit tests pass with `npx jest src/app/services/BaileysSocketManager.spec.ts`
- [ ] `npx eslint src/app/services/` passes
- [ ] Changes committed to `plan/baileys-socket-monitor/phase-1/task-01-socket-manager` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-02 (receipt-parsing) modifies `Baileys.ts`. This task does not touch that file.
- Auth state logic is intentionally duplicated here rather than shared to avoid creating a cross-task file dependency in this phase.
