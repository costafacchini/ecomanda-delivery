# Task: Setor model + CRUD API

**Plan**: Setores
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-setor-model-api
**Depends On**: None
**JIRA**: N/A

## Objective

Create the `Setor` model, repository, controller, and CRUD API endpoints. A sector belongs to a licensee, requires at least one user, and can be active or inactive.

## Context

Follow the existing model/repository/controller pattern. Good references:
- `src/app/models/Room.ts` — minimal model shape
- `src/app/models/User.ts` — model with validation and pre-save hook
- `src/app/repositories/whatsappsession.ts` — repository pattern (Database + Memory variants)
- `src/app/controllers/LicenseesController.ts` — controller constructor with use case injection

Routes follow the pattern in `src/app/routes/resources-routes.ts`.

The `users` array on Setor must have at minimum 1 element — enforce at the model level with a Mongoose validator.

Read `docs/kb/architecture/express-conventions.md` before writing the controller and routes.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/setores/phase-1/task-01-setor-model-api`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Read `src/app/models/User.ts` and `src/app/repositories/whatsappsession.ts`
- [ ] Read `src/app/routes/resources-routes.ts` (scan for existing patterns, don't need to read all routes)
- [ ] Read `docs/kb/architecture/express-conventions.md`
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/models/Setor.ts` | create | Mongoose schema |
| `src/app/models/Setor.spec.ts` | create | Model validation tests |
| `src/app/repositories/setor.ts` | create | Database + Memory repositories |
| `src/app/repositories/setor.spec.ts` | create | Repository tests |
| `src/app/controllers/SetoresController.ts` | create | CRUD only — Baileys methods added in phase-2/task-03 |
| `src/app/controllers/SetoresController.spec.ts` | create | Controller tests |
| `src/app/routes/resources-routes.ts` | modify | Add sector CRUD routes |
| `src/app/runtime/dependencies.ts` | modify | Add `setorRepository` |

### Do NOT Modify

- `src/app/models/WhatsappSession.ts` — owned by phase-1/task-02-schema-migrations
- `src/app/models/Room.ts` — owned by phase-1/task-02-schema-migrations
- `src/app/models/Licensee.ts` — owned by phase-1/task-02-schema-migrations
- `src/app/services/BaileysSocketManager.ts` — owned by phase-2/task-03

## Implementation Steps

### Step 1: Create `src/app/models/Setor.ts`

```ts
const setorSchema = new Schema({
  _id: ObjectId,
  name: {
    type: String,
    required: [true, 'Nome: Você deve preencher o campo'],
  },
  licensee: {
    type: ObjectId,
    ref: 'Licensee',
    required: [true, 'Licensee: Você deve preencher o campo'],
  },
  users: {
    type: [{ type: ObjectId, ref: 'User' }],
    validate: {
      validator: (arr) => arr.length >= 1,
      message: 'Usuários: Informe ao menos um usuário',
    },
  },
  active: { type: Boolean, default: true },
}, { timestamps: true })
```

Add the standard pre-save `_id` auto-generation and `toJSON` virtual, following the pattern in `User.ts`.

### Step 2: Create `src/app/repositories/setor.ts`

Follow the exact pattern of `src/app/repositories/whatsappsession.ts`:
- `SetorRepositoryDatabase extends Repository` — backed by Mongoose model
- `SetorRepositoryMemory extends RepositoryMemory` — for tests

### Step 3: Create `src/app/controllers/SetoresController.ts`

Methods:
- `index(req, res)` — list sectors, filter by `licensee` query param, populate `users`
- `show(req, res)` — get single sector by `req.params.id`
- `create(req, res)` — create sector from `req.body`
- `update(req, res)` — update sector by `req.params.id`
- `destroy(req, res)` — delete sector by `req.params.id`

Follow the pattern of `LicenseesController.ts` for error handling (try/catch returning 500 on error).

### Step 4: Add routes to `src/app/routes/resources-routes.ts`

```ts
router.get('/setores', setoresController.index)
router.get('/setores/:id', setoresController.show)
router.post('/setores', setoresController.create)
router.put('/setores/:id', setoresController.update)
router.delete('/setores/:id', setoresController.destroy)
```

Add route authorization middleware matching the existing pattern (admin/super only for CRUD).

### Step 5: Wire `setorRepository` in `src/app/runtime/dependencies.ts`

Import `SetorRepositoryDatabase` and add to both `buildRuntimeDependencies` and `createRuntimeDependencies`.

## Testing

- [ ] `Setor` model: creation fails when `users` is empty
- [ ] `Setor` model: creation fails when `name` is missing
- [ ] `Setor` model: creation fails when `licensee` is missing
- [ ] `SetoresController.create`: returns 201 with valid body
- [ ] `SetoresController.create`: returns 422 when users array is empty
- [ ] `SetoresController.index`: filters by `licensee` query param
- [ ] `SetoresController.destroy`: removes the record
- [ ] All existing tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc updates required at this task — the full feature is documented in the plan overview

## Completion Criteria

- [ ] Model, repository, controller, and routes created
- [ ] `setorRepository` wired in `dependencies.ts`
- [ ] All unit tests pass: `npx jest src/app/models/Setor.spec.ts src/app/controllers/SetoresController.spec.ts`
- [ ] `npx eslint src/app/models/Setor.ts src/app/repositories/setor.ts src/app/controllers/SetoresController.ts` passes
- [ ] Changes committed to `plan/setores/phase-1/task-01-setor-model-api` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-02 touches only model files (`WhatsappSession.ts`, `Room.ts`, `Licensee.ts`). No overlap with this task.
