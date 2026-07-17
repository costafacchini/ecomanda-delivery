# Task: Plugin factories + Baileys inbox sessions + BaileysSocketManager

**Plan**: inbox-concept
**Phase**: 2
**Task ID (phase-local)**: task-04
**Task Path**: phase-2/task-04-plugin-factory
**Spec References**: Story 2 (P1) — FR-007, FR-008, FR-010; Story 3 partial — FR-010
**Depends On**: phase-1/task-01-inbox-model-api, phase-1/task-02-schema-migrations
**JIRA**: N/A

## Objective

Update plugin factories (messenger + chat) to use inbox config when an inbox is provided, falling back to licensee config. Update the Baileys plugin and `BaileysSocketManager` to key sessions by inbox instead of department. Update `DepartmentsController` Baileys endpoints to delegate through the department's linked inbox.

## Context

The messenger plugin factory currently calls `createMessengerPlugin(licensee, dependencies)` and switches on `licensee.whatsappDefault`. With inboxes, the factory should prefer `inbox.whatsappDefault` when an inbox is provided.

The Baileys plugin stores and loads `WhatsappSession` records using `{ licensee, department }`. After task-02, WhatsappSession uses `inbox` instead of `department`. This task updates Baileys to use `inbox`.

`BaileysSocketManager` currently checks `isConnectedForLicensee(licenseeId, departmentId)`. This becomes `isConnectedForLicensee(licenseeId, inboxId)`.

Key references:
- `src/app/plugins/messengers/factory.ts`
- `src/app/plugins/chats/factory.ts` (if exists — check)
- `src/app/plugins/messengers/Baileys.ts` — `_department` → `_inbox`
- `src/app/services/BaileysSocketManager.ts`
- `src/app/controllers/DepartmentsController.ts` — Baileys methods must delegate through inbox
- `src/app/usecases/licensees/GetBaileysQrForDepartment.ts` — update to use inbox when department.inbox is set
- `src/app/usecases/licensees/GetBaileysStatusForDepartment.ts` — same
- `src/app/usecases/licensees/SyncBaileysDirectoryForDepartment.ts` — same
- `src/app/runtime/dependencies.ts` — wiring for startBaileysSocket with inbox

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify phase-1/task-01 status.md shows `complete`
- [ ] Verify phase-1/task-02 status.md shows `complete`
- [ ] Read `src/app/plugins/messengers/Baileys.ts` — understand `_department` usage
- [ ] Read `src/app/services/BaileysSocketManager.ts` — understand current keying
- [ ] Read `src/app/plugins/messengers/factory.ts` — understand factory signature
- [ ] Read `src/app/usecases/licensees/GetBaileysQrForDepartment.ts`
- [ ] Mark task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/messengers/factory.ts` | modify | Accept optional `inbox` param; use inbox config when provided |
| `src/app/plugins/messengers/Baileys.ts` | modify | `_department` → `_inbox`; session query uses `inbox` |
| `src/app/plugins/messengers/Baileys.spec.ts` | modify | Update tests for inbox-based sessions |
| `src/app/plugins/chats/factory.ts` | modify | Accept optional `inbox` param; use inbox config when provided |
| `src/app/services/BaileysSocketManager.ts` | modify | `isConnectedForLicensee(licenseeId, inboxId)` |
| `src/app/services/BaileysSocketManager.spec.ts` | modify | Update tests |
| `src/app/controllers/DepartmentsController.ts` | modify | Baileys methods: delegate to inbox use cases when department.inbox is set |
| `src/app/controllers/DepartmentsController.spec.ts` | modify | Update Baileys tests |
| `src/app/usecases/licensees/GetBaileysQrForDepartment.ts` | modify | When department.inbox is set, delegate to GetBaileysQrForInbox |
| `src/app/usecases/licensees/GetBaileysQrForDepartment.spec.ts` | modify | Add delegation test |
| `src/app/usecases/licensees/GetBaileysStatusForDepartment.ts` | modify | When department.inbox is set, delegate to GetBaileysStatusForInbox |
| `src/app/usecases/licensees/GetBaileysStatusForDepartment.spec.ts` | modify | Add delegation test |
| `src/app/usecases/licensees/SyncBaileysDirectoryForDepartment.ts` | modify | When department.inbox is set, delegate to SyncBaileysDirectoryForInbox |
| `src/app/runtime/dependencies.ts` | modify | Update startBaileysSocket closure to pass inbox instead of department |

### Do NOT Modify

- `src/app/routes/api-routes.ts` — owned by phase-2/task-03-auth-routing
- `src/app/controllers/MessengersController.ts` — owned by phase-2/task-03-auth-routing
- `src/app/models/Inbox.ts` — owned by phase-1/task-01-inbox-model-api

## Implementation Steps

### Step 1: Messenger factory (`factory.ts`)

Change signature to accept optional `inbox` parameter:
```typescript
function createMessengerPlugin(licensee, dependencies = {}, inbox = null) {
  const plugin = inbox?.whatsappDefault || licensee.whatsappDefault
  switch (plugin) {
    case 'baileys': return new Baileys(licensee, { ...dependencies, inbox })
    case 'utalk': return new Utalk(licensee, dependencies)
    // other cases unchanged
  }
}
```

### Step 2: Baileys plugin (`Baileys.ts`)

Replace `_department` with `_inbox`:
```typescript
constructor(licensee, { whatsappSessionRepository, inbox, ...dependencies }) {
  super(licensee, dependencies)
  this._inbox = inbox ?? null
}
```

Update `loadOrCreateSession()` to use `{ licensee, inbox: this._inbox }`.
Update `saveSession()` similarly.

### Step 3: Chat factory

Locate `src/app/plugins/chats/factory.ts`. Apply the same pattern — accept optional `inbox` param, use `inbox.chatDefault` when provided.

### Step 4: BaileysSocketManager

Replace all `departmentId` / `department` references with `inboxId` / `inbox`. The `isConnectedForLicensee(licenseeId, departmentId = null)` signature becomes `isConnectedForLicensee(licenseeId, inboxId = null)`.

Update session lookup: `session.inbox` instead of `session.department`.

### Step 5: Department Baileys use case delegation

In `GetBaileysQrForDepartment`, after loading the department, check if `department.inbox` is set:
```typescript
if (department.inbox) {
  return this.getBaileysQrForInbox.execute(department.inbox)
}
// existing department-scoped logic as fallback
```

Apply same pattern to `GetBaileysStatusForDepartment` and `SyncBaileysDirectoryForDepartment`.

These use cases need `getBaileysQrForInbox` injected — add to their constructors.

### Step 6: `dependencies.ts`

Update `startBaileysSocket` closure — pass `inbox` instead of `department` to Baileys constructor and socket manager calls.

## Testing

**Spec scenarios covered**:
- [ ] Story 2 / Scenario 2 — Department with inbox linked → GET baileys-qr reflects inbox's session → `src/app/controllers/DepartmentsController.spec.ts`
- [ ] Story 2 / Scenario 3 — Department with no inbox → falls back to old department behavior → `src/app/usecases/licensees/GetBaileysQrForDepartment.spec.ts`

**Additional verification**:
- [ ] Factory uses inbox.whatsappDefault when inbox provided
- [ ] Factory falls back to licensee.whatsappDefault when inbox is null
- [ ] Baileys plugin loads session by `{ licensee, inbox }` (not department)
- [ ] BaileysSocketManager `isConnectedForLicensee(licenseeId, inboxId)` correctly identifies active sockets
- [ ] All existing tests still pass: `npx jest`
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Update `docs/kb/features/baileys-whatsapp-guide.md` — document inbox-based session flow
- [ ] Run `check-kb-index`

## Completion Criteria

- [ ] Plugin factories use inbox config when provided
- [ ] Baileys sessions keyed by inbox
- [ ] BaileysSocketManager updated
- [ ] Department Baileys endpoints delegate through inbox when department.inbox is set
- [ ] All spec scenarios for Story 2 pass
- [ ] `npx jest` green
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- task-03 owns `api-routes.ts`, `MessengersController.ts`, `ChatsController.ts`. Do not touch those.
- Both Phase 2 tasks are independent — confirm no shared files before starting.
