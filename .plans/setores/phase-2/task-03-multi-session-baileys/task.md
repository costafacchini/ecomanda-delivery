# Task: Multi-session BaileysSocketManager + sector Baileys endpoints

**Plan**: Setores
**Phase**: 2
**Task ID (phase-local)**: task-03
**Task Path**: phase-2/task-03-multi-session-baileys
**Depends On**: phase-1/task-01-setor-model-api, phase-1/task-02-schema-migrations
**JIRA**: N/A

## Objective

Re-key `BaileysSocketManager` from `licenseeId` to `WhatsappSession._id` so multiple sessions per licensee are supported, and add Baileys QR/status/sync endpoints scoped to sectors.

## Context

**Current keying (from `baileys-socket-monitor` plan):**
```ts
this._sockets = new Map() // key: licenseeId.toString()
```

**Problem:** With sectors, one licensee can have N+1 sessions (main + one per sector with a number). The map key must be unique per session, not per licensee.

**New keying:**
```ts
this._sockets = new Map() // key: whatsappSession._id.toString()
```

`StartBaileysSocket` must be updated to accept an optional `setor` parameter and load the correct `WhatsappSession` for `{ licensee, setor }` (null setor = main number). The `session._id` becomes the socket key.

**`isConnected()` signature change:**
- Current: `isConnected(licenseeId)`
- New: `isConnected(sessionId)` — callers need to know the session ID, or add a helper `isConnectedForLicensee(licenseeId, setorId = null)` that looks up the session and checks the key.

**`BootBaileysSocketSessions` update:**
Currently iterates licensees and starts one socket per licensee. Must now iterate all `WhatsappSession` records with non-empty creds (joining `setor` data when present) and start a socket for each.

**Sector Baileys endpoints** follow the exact pattern of the licensee endpoints in `LicenseesController`:

| Licensee route | Sector equivalent |
|---------------|-------------------|
| `POST /licensees/:id/baileys-qr` | `POST /setores/:id/baileys-qr` |
| `GET /licensees/:id/baileys-status` | `GET /setores/:id/baileys-status` |
| `POST /licensees/:id/baileys-sync` | `POST /setores/:id/baileys-sync` |

These load the sector, get its licensee, and operate on the `WhatsappSession` for `{ licensee, setor }`.

Read `src/app/usecases/licensees/GetBaileysQr.ts`, `GetBaileysStatus.ts`, and `SyncBaileysDirectory.ts` before implementing — the sector variants are thin wrappers that pass `setor` context.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/setores/phase-2/task-03-multi-session-baileys`
- [ ] Verify `phase-1/task-01-setor-model-api/status.md` shows `complete`
- [ ] Verify `phase-1/task-02-schema-migrations/status.md` shows `complete`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Read `src/app/services/BaileysSocketManager.ts` (full file)
- [ ] Read `src/app/usecases/licensees/StartBaileysSocket.ts`
- [ ] Read `src/app/usecases/licensees/BootBaileysSocketSessions.ts`
- [ ] Read `src/app/usecases/licensees/GetBaileysQr.ts`, `GetBaileysStatus.ts`, `SyncBaileysDirectory.ts`
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/services/BaileysSocketManager.ts` | modify | Re-key by session._id; add `isConnectedForLicensee` helper |
| `src/app/usecases/licensees/StartBaileysSocket.ts` | modify | Accept optional `setor` param; key socket by session._id |
| `src/app/usecases/licensees/BootBaileysSocketSessions.ts` | modify | Iterate all WhatsappSession records, not just licensees |
| `src/app/usecases/licensees/GetBaileysQrForSetor.ts` | create | Use case: QR for a sector session |
| `src/app/usecases/licensees/GetBaileysStatusForSetor.ts` | create | Use case: status for a sector session |
| `src/app/usecases/licensees/SyncBaileysDirectoryForSetor.ts` | create | Use case: group sync for a sector session |
| `src/app/controllers/SetoresController.ts` | modify | Add `getBaileysQr`, `getBaileysStatus`, `baileysSync` methods |
| `src/app/routes/resources-routes.ts` | modify | Add sector Baileys routes |
| `src/app/runtime/dependencies.ts` | modify | Wire new sector Baileys use cases |

### Do NOT Modify

- `src/app/models/WhatsappSession.ts` — complete (phase 1)
- `src/app/models/Setor.ts` — complete (phase 1)
- `src/app/plugins/messengers/Baileys.ts` — read-only; `loadOrCreateSession` will be called with `setor` context from use cases

## Implementation Steps

### Step 1: Re-key `BaileysSocketManager`

Change `start(licensee, callbacks)` signature to `start(session, licensee, callbacks)` where `session` is the `WhatsappSession` document. The socket key becomes `session._id.toString()`.

Add helper:
```ts
isConnectedForLicensee(licenseeId: any, setorId: any = null): boolean {
  // Find session in _sockets where session.licensee === licenseeId && session.setor === setorId
  for (const [, { session }] of this._sockets) {
    if (session.licensee.toString() === licenseeId.toString() &&
        String(session.setor ?? null) === String(setorId ?? null)) {
      return true
    }
  }
  return false
}
```

Store the session document alongside the socket in the registry:
```ts
this._sockets.set(key, { socket, licensee, session })
```

### Step 2: Update `StartBaileysSocket`

```ts
async execute(licensee: any, setor: any = null) {
  const session = await loadOrFindSession(licensee._id, setor?._id ?? null)
  const plugin = this.createMessengerPlugin(licensee)

  await this.socketManager.start(session, licensee, {
    onMessage: async (msg: any) => { ... },          // same as before
    onReceiptUpdate: async (update: any) => { ... }, // same as before
    onLogout: () => { ... },                         // same as before
    setor,                                           // passed through to onMessage handler
  })
}
```

The `onMessage` callback must receive `setor` in its closure so it can pass `setorId` when creating the Room (task-04 wires this — for now, pass `setor` through without breaking existing behavior).

### Step 3: Update `BootBaileysSocketSessions`

Change from iterating licensees to iterating all WhatsappSession records with non-empty creds:
```ts
const sessions = await this.whatsappSessionRepository.find({})
for (const session of sessions) {
  if (!session.creds || Object.keys(session.creds).length === 0) continue
  const licensee = await this.licenseeRepository.findFirst({ _id: session.licensee })
  const setor = session.setor
    ? await this.setorRepository.findFirst({ _id: session.setor })
    : null
  await this.startBaileysSocket(licensee, setor)
}
```

### Step 4: Create sector Baileys use cases

`GetBaileysQrForSetor`, `GetBaileysStatusForSetor`, `SyncBaileysDirectoryForSetor` — each loads the `Setor` record (checking `setor.licensee`), then delegates to the existing licensee-level use case logic passing `{ licensee, setor }` context for session lookup.

### Step 5: Add to `SetoresController` and routes

Add `getBaileysQr`, `getBaileysStatus`, `baileysSync` methods to `SetoresController` mirroring the licensee controller methods but calling sector use cases.

Add to `resources-routes.ts`:
```ts
router.post('/setores/:id/baileys-qr', setoresController.getBaileysQr)
router.get('/setores/:id/baileys-status', setoresController.getBaileysStatus)
router.post('/setores/:id/baileys-sync', setoresController.baileysSync)
```

## Testing

- [ ] `BaileysSocketManager.start()` — two sessions for the same licensee (main + sector) both stored under different keys
- [ ] `BaileysSocketManager.isConnectedForLicensee(licenseeId, null)` — returns true for main session
- [ ] `BaileysSocketManager.isConnectedForLicensee(licenseeId, setorId)` — returns true for sector session
- [ ] `BootBaileysSocketSessions` — starts sockets for all sessions (main + sector) with non-empty creds
- [ ] `StartBaileysSocket` with `setor = null` — loads session with `{ licensee, setor: null }`
- [ ] `StartBaileysSocket` with `setor` — loads session with `{ licensee, setor: setor._id }`
- [ ] All existing `BaileysSocketManager` and `StartBaileysSocket` tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc updates required at this task

## Completion Criteria

- [ ] `BaileysSocketManager` re-keyed by `session._id`
- [ ] `StartBaileysSocket` accepts optional `setor` param
- [ ] `BootBaileysSocketSessions` iterates all sessions
- [ ] Sector Baileys endpoints operational
- [ ] All tests pass
- [ ] Changes committed to `plan/setores/phase-2/task-03-multi-session-baileys` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-04 modifies `IngestMessengerMessage` and Room creation logic. This task does not touch those files.
