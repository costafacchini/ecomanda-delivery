# Task: Inbox model + CRUD API + Baileys endpoints

**Plan**: inbox-concept
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-inbox-model-api
**Spec References**: Story 1 (P1) — FR-001, FR-002, FR-003; Story 2 partial (P1) — FR-007 (inbox CRUD side)
**Depends On**: None
**JIRA**: N/A

## Objective

Create the `Inbox` Mongoose model, repository, factory, and controller with full CRUD plus Baileys QR/status/sync endpoints for messenger inboxes. Register routes and wire the repository into dependencies.

## Context

The `Inbox` model is the core new entity. Follow the `Department` model/repository/controller pattern exactly — it was created in the `setores` plan and is the closest prior art.

Key references:
- `src/app/models/Department.ts` — schema pattern (UUID token, virtual URL, active flag)
- `src/app/repositories/department.ts` — `DepartmentRepositoryDatabase` + `DepartmentRepositoryMemory` pattern
- `src/app/controllers/DepartmentsController.ts` — CRUD + Baileys delegation pattern
- `src/app/usecases/licensees/GetBaileysQrForDepartment.ts` — QR use case to replicate for inbox
- `src/app/usecases/licensees/GetBaileysStatusForDepartment.ts` — status use case to replicate for inbox
- `src/app/usecases/licensees/SyncBaileysDirectoryForDepartment.ts` — sync use case to replicate for inbox
- `src/app/routes/resources-routes.ts` — where to register `/inboxes` routes
- `src/app/runtime/dependencies.ts` — where to add `inboxRepository`
- `src/app/repositories/testing.ts` — where to add `inboxRepository` for tests
- `src/app/repositories/index.ts` — where to add the inbox repository import
- `src/app/models/index.ts` — where to add the inbox model import
- `docs/kb/architecture/dependency-injection-runtime-wiring.md` — DI wiring pattern

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Read `src/app/models/Department.ts` — understand schema shape, UUID generation, virtual webhookUrl
- [ ] Read `src/app/controllers/DepartmentsController.ts` — understand the Baileys delegation pattern
- [ ] Read `src/app/usecases/licensees/GetBaileysQrForDepartment.ts` — understand the QR use case
- [ ] Read `docs/kb/architecture/dependency-injection-runtime-wiring.md`
- [ ] Mark task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/models/Inbox.ts` | create | Mongoose schema — see Implementation Steps |
| `src/app/models/Inbox.spec.ts` | create | Model unit tests |
| `src/app/repositories/inbox.ts` | create | `InboxRepositoryDatabase` + `InboxRepositoryMemory` |
| `src/app/repositories/inbox.spec.ts` | create | Repository tests |
| `src/app/factories/inbox.ts` | create | fishery factory for tests |
| `src/app/controllers/InboxesController.ts` | create | CRUD + Baileys methods |
| `src/app/controllers/InboxesController.spec.ts` | create | Controller tests |
| `src/app/usecases/licensees/GetBaileysQrForInbox.ts` | create | QR use case keyed by inbox |
| `src/app/usecases/licensees/GetBaileysQrForInbox.spec.ts` | create | QR use case tests |
| `src/app/usecases/licensees/GetBaileysStatusForInbox.ts` | create | Status use case keyed by inbox |
| `src/app/usecases/licensees/GetBaileysStatusForInbox.spec.ts` | create | Status use case tests |
| `src/app/usecases/licensees/SyncBaileysDirectoryForInbox.ts` | create | Sync use case keyed by inbox |
| `src/app/usecases/licensees/SyncBaileysDirectoryForInbox.spec.ts` | create | Sync use case tests |
| `src/app/models/index.ts` | modify | Add `import './Inbox'` |
| `src/app/repositories/index.ts` | modify | Add `import './inbox'` |
| `src/app/repositories/testing.ts` | modify | Add `inboxRepository` binding |
| `src/app/routes/resources-routes.ts` | modify | Register `/inboxes` routes |
| `src/app/runtime/dependencies.ts` | modify | Add `inboxRepository` |

### Do NOT Modify

- `src/app/models/Department.ts` — owned by phase-1/task-02-schema-migrations
- `src/app/models/WhatsappSession.ts` — owned by phase-1/task-02-schema-migrations
- `src/app/models/Room.ts` — owned by phase-1/task-02-schema-migrations
- `src/app/models/Message.ts` — owned by phase-1/task-02-schema-migrations
- `src/app/models/Body.ts` — owned by phase-1/task-02-schema-migrations

## Implementation Steps

### Step 1: Inbox Mongoose schema (`src/app/models/Inbox.ts`)

Fields:
```typescript
{
  _id: ObjectId (auto)
  name: string (required, trim)
  licensee: ObjectId (ref: 'Licensee', required)
  kind: enum ['messenger', 'chat'] (required)

  // Messenger fields (relevant when kind='messenger')
  whatsappDefault: enum ['utalk', 'dialog', 'ycloud', 'pabbly', 'baileys', ''] (default: '')
  whatsappToken: string (optional)
  whatsappUrl: string (optional)

  // Chat fields (relevant when kind='chat')
  chatDefault: enum ['rocketchat', 'crisp', 'cuboup', 'chatwoot', 'local', ''] (default: '')
  chatUrl: string (optional)
  chatKey: string (optional)
  chatIdentifier: string (optional)

  inboxToken: string (unique, auto-generated UUID on pre-validate)
  active: boolean (default: true)
  timestamps: true
}
```

Virtual `webhookUrl` (messenger only, requires licensee populated):
```
/api/v1/messenger/message/?token={licensee.apiToken}&inbox={inboxToken}
```

Return `null` if licensee is not populated. Follow `Department.ts` pattern exactly.

### Step 2: Repository (`src/app/repositories/inbox.ts`)

Create `InboxRepositoryDatabase` and `InboxRepositoryMemory` following `src/app/repositories/department.ts` exactly. Export both.

### Step 3: Factory (`src/app/factories/inbox.ts`)

Create a fishery factory. Follow `src/app/factories/department.ts`. Default to `kind: 'messenger'`, `whatsappDefault: 'baileys'`, `active: true`.

### Step 4: Baileys use cases for inbox

Create three use cases modelled exactly on their `ForDepartment` counterparts:

- `GetBaileysQrForInbox` — same logic as `GetBaileysQrForDepartment` but:
  - Receives `inboxId` (not `departmentId`)
  - Loads inbox → checks `inbox.whatsappDefault === 'baileys'`
  - Loads `WhatsappSession` by `{ licensee: licensee._id, inbox: inbox._id }`
  
- `GetBaileysStatusForInbox` — same logic as `GetBaileysStatusForDepartment` but inbox-keyed

- `SyncBaileysDirectoryForInbox` — same logic as `SyncBaileysDirectoryForDepartment` but inbox-keyed

Note: `WhatsappSession.inbox` field is created in task-02. Stub the session query now and verify after task-02 merges.

### Step 5: Controller (`src/app/controllers/InboxesController.ts`)

CRUD methods: `index`, `create`, `update`, `destroy` — following `DepartmentsController.ts`.
Baileys methods: `baileysQr`, `baileysStatus`, `baileysSync` — delegate to the three use cases above.

### Step 6: Wire everything

- `models/index.ts` — add `import './Inbox'`
- `repositories/index.ts` — add import
- `repositories/testing.ts` — add `inboxRepository` (follow `departmentRepository` pattern)
- `runtime/dependencies.ts` — add `inboxRepository: new InboxRepositoryDatabase()`
- `routes/resources-routes.ts` — add CRUD routes at `/inboxes` and Baileys sub-routes at `/inboxes/:id/baileys-qr` etc.

## Testing

**Spec scenarios covered**:
- [ ] Story 1 / Scenario 1 — POST `/resources/inboxes` creates inbox with inboxToken → `src/app/controllers/InboxesController.spec.ts`
- [ ] Story 1 / Scenario 2 — GET `/resources/inboxes?licensee=X` returns all inboxes → `src/app/controllers/InboxesController.spec.ts`
- [ ] Story 1 / Scenario 3 — `inbox.webhookUrl` resolves correctly when licensee populated → `src/app/models/Inbox.spec.ts`
- [ ] Story 1 / Scenario 4 — Missing name → 422 error → `src/app/controllers/InboxesController.spec.ts`
- [ ] Story 1 / Scenario 5 — PUT updates inbox → `src/app/controllers/InboxesController.spec.ts`
- [ ] Story 1 / Scenario 6 — DELETE removes inbox → `src/app/controllers/InboxesController.spec.ts`

**Additional verification**:
- [ ] `inboxToken` auto-generated as UUID on create
- [ ] `webhookUrl` returns null when licensee not populated
- [ ] `active` defaults to true
- [ ] GetBaileysQrForInbox returns `{ connected: false }` when inbox not found
- [ ] GetBaileysStatusForInbox returns `{ connected: false }` when inbox.whatsappDefault !== 'baileys'
- [ ] All existing tests still pass: `npx jest`
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] After completion, run `document-solution` — Inbox model + CRUD pattern is a new reusable pattern
- [ ] Run `check-kb-index` after any KB changes

## Completion Criteria

- [ ] All spec scenarios for Story 1 pass (no pending stubs remain)
- [ ] Inbox CRUD API functional end-to-end
- [ ] Baileys QR/status/sync use cases created and tested for inbox
- [ ] All wiring (routes, dependencies, testing repo) complete
- [ ] `npx jest` green
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- task-02 modifies `WhatsappSession.ts` to replace `department` with `inbox`. The Baileys use cases in this task query `WhatsappSession` by `inbox`. Stub the session query pattern now; confirm after task-02 merges.
- task-02 modifies `Department.ts` to add an `inbox` FK — do not touch `Department.ts` in this task.
