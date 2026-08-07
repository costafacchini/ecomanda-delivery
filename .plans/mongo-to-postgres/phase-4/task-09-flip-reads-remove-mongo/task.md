# Task: Flip reads to Postgres, remove Mongoose

**Plan**: MongoDB → PostgreSQL Migration
**Phase**: 4
**Task ID (phase-local)**: task-09
**Task Path**: phase-4/task-09-flip-reads-remove-mongo
**Depends On**: phase-4/task-08-bulk-sync-validate
**JIRA**: N/A

## Objective

Shift all repository reads from MongoDB (Mongoose) to PostgreSQL (Prisma), remove the `DualWriteRepository` wrapper (Prisma repos become the sole implementation), delete all Mongoose-based `Database*Repository` classes, delete all Mongoose models, remove the `mongoose` package, update environment config and CI, and run the full test suite.

## Context

After task-08:
- Postgres contains 100% of production data (validated)
- Dual-write is synchronous (both stores in sync on every write)
- All 10 Prisma repos are implemented and tested

The flip is done by replacing each `DualWriteRepository` with the Prisma repo directly in `dependencies.ts`. After the flip, Mongo receives no more writes — it can be kept running as a fallback read store for a short observation window, then decommissioned.

**This task is the point of no return for the Mongo primary write path.** Confirm with the assigned dev before deploying the read flip.

Note: `mongo_id` columns and `VARCHAR(24)` FK columns are **NOT removed in this task** — they are still needed as the cross-reference for task-10. Do not drop them here.

Architecture docs:
- `docs/kb/architecture/dependency-injection-runtime-wiring.md`
- `docs/kb/architecture/project-overview.md`

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-4/task-08-bulk-sync-validate/status.md` is `complete`
- [ ] Confirm validation report in task-08 status.md shows 0 FAIL
- [ ] Confirm no `[DualWrite] Secondary write failed` errors in production logs for 24h post task-08
- [ ] Check this task's `status.md`; mark `in-progress`
- [ ] Read `src/app/runtime/dependencies.ts` in full

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/runtime/dependencies.ts` | modify | Replace all DualWriteRepository with Prisma repos |
| `src/app/repositories/index.ts` | modify | Remove Database* exports; keep Prisma* and RepositoryMemory |
| `src/app/repositories/repository.ts` | modify | Remove DualWriteRepository export; keep PrismaRepository, RepositoryMemory |
| `src/app/repositories/licensee.ts` | modify | Delete DatabaseLicenseeRepository; keep PrismaLicenseeDatabaseRepository |
| `src/app/repositories/user.ts` | modify | Delete Database* |
| `src/app/repositories/contact.ts` | modify | Delete Database* |
| `src/app/repositories/message.ts` | modify | Delete Database* |
| `src/app/repositories/room.ts` | modify | Delete Database* |
| `src/app/repositories/template.ts` | modify | Delete Database* |
| `src/app/repositories/trigger.ts` | modify | Delete Database* |
| `src/app/repositories/inbox.ts` | modify | Delete Database* |
| `src/app/repositories/department.ts` | modify | Delete Database* |
| `src/app/repositories/whatsappsession.ts` | modify | Delete Database* |
| `src/app/repositories/body.ts` | modify | Delete Database* |
| `src/app/repositories/trafficlight.ts` | modify | Delete Database* |
| `src/app/models/Licensee.ts` | delete | Mongoose model removed |
| `src/app/models/Contact.ts` | delete | Mongoose model removed |
| `src/app/models/Message.ts` | delete | Mongoose model removed |
| `src/app/models/Room.ts` | delete | Mongoose model removed |
| `src/app/models/Template.ts` | delete | Mongoose model removed |
| `src/app/models/Trigger.ts` | delete | Mongoose model removed |
| `src/app/models/User.ts` | delete | Mongoose model removed |
| `src/app/models/WhatsappSession.ts` | delete | Mongoose model removed |
| `src/app/models/Body.ts` | delete | Mongoose model removed |
| `src/app/models/Inbox.ts` | delete | Mongoose model removed |
| `src/app/models/Department.ts` | delete | Mongoose model removed |
| `src/app/models/Trafficlight.ts` | delete | Mongoose model removed |
| `src/app/models/index.ts` | delete | No longer needed |
| `src/config/mongo.ts` | delete | MongoServer class removed |
| `src/config/database.ts` | modify | Remove Mongo connect; keep connectPostgres; make it fatal if DATABASE_URL missing |
| `package.json` | modify | Remove mongoose dependency |
| `jest.config.mjs` | modify | Remove any @shelf/jest-mongodb or mongodb-memory-server setup |
| CI workflow files | modify | Remove MongoDB service from CI; keep Postgres service |

### Do NOT Modify

- `src/app/repositories/repository.ts` — keep RepositoryMemory and PrismaRepository (but remove DualWriteRepository)
- Individual spec files that use RepositoryMemory — they continue to work unchanged
- `src/scripts/sync-*.ts` — keep for historical reference or archival

## Implementation Steps

### Step 0: Test pre-audit (do this before touching any code)

Run the following to produce the full list of files that will break when model files are deleted:

```bash
grep -rl "from.*@models/\|from.*models/" src --include="*.spec.js" | sort
```

Expected output falls into four categories — handle each differently:

#### Category A — Model spec files (delete)
`src/app/models/*.spec.ts` — these test Mongoose pre-save hooks and validators directly. The equivalent behaviour is now covered by the `*.prisma.spec.ts` files added in phases 2–3. **Delete each file.**

```
src/app/models/Licensee.spec.js
src/app/models/Contact.spec.js
src/app/models/Message.spec.js
src/app/models/Room.spec.js
src/app/models/Template.spec.js
src/app/models/Trigger.spec.js
src/app/models/User.spec.js
src/app/models/Body.spec.js
src/app/models/Trafficlight.spec.js
```

(Models removed by `remove-pdv` — `Backgroundjob.spec.ts`, `Order.spec.ts`, `Product.spec.ts`, `Cart.spec.ts`, `Integrationlog.spec.ts` — should already be deleted by that plan.)

#### Category B — Repository specs that test `DatabaseRepository` (delete)
`src/app/repositories/*.spec.ts` files that import a `*RepositoryDatabase` class and call `mongoServer.connect()`. These test the Mongoose-backed implementation, which is being removed. The `*.prisma.spec.ts` counterparts added in phases 2–3 replace them.

Check each file:
```bash
grep -l "mongoServer\|RepositoryDatabase" src/app/repositories/*.spec.js
```

Delete every file that matches. Repository specs that only use `RepositoryMemory` (e.g. `memory-core.spec.ts`, `memory-lookup.spec.ts`, `memory-secondary.spec.ts`) are **safe — do not delete**.

#### Category C — Service and plugin specs that call `Model.create()` / `Model.findById()` (update)
These specs import `@models/Body`, `@models/Room`, `@models/Trigger` etc. and call Mongoose static methods to set up test state (e.g. `await Body.create(bodyFactory.build(...))`). They already use `installMemoryRepositories` for their primary repo wiring — the fix is to replace every Mongoose active-record call with the equivalent memory-repo call.

**Pattern for the fix** (example: `ChatMessage.spec.ts`):

Before:
```js
import Body from '@models/Body'
// ...
const body = await Body.create(bodyFactory.build({ licensee: licensee }))
// ...
const bodyDeleted = await Body.findById(body._id)
expect(bodyDeleted).toEqual(null)
```

After:
```js
// Remove the `import Body from '@models/Body'` line entirely
// Access the in-memory repo installed by installMemoryRepositories
const bodyRepo = dependencies.bodyRepository  // or however the repo is accessed
const body = await bodyRepo.create(bodyFactory.build({ licensee: licensee }))
// ...
const bodyDeleted = await bodyRepo.findFirst({ where: { id: body.id } })
expect(bodyDeleted).toBeNull()
```

Run the audit first, then fix each file. Typically 1–3 line changes per spec.

Files expected to need this fix (verify with the audit command above):
```
src/app/services/ChatMessage.spec.js
src/app/services/ChatbotMessage.spec.js
src/app/services/ChatbotTransfer.spec.js
src/app/plugins/chats/Chatwoot.spec.js
src/app/plugins/chats/Crisp.spec.js
src/app/plugins/chats/Cuboup.spec.js
src/app/plugins/chats/Rocketchat.spec.js
src/app/plugins/chatbots/Landbot.spec.js
src/app/plugins/messengers/Dialog.spec.js
src/app/plugins/importers/facebook_catalog/index.spec.js
src/app/plugins/importers/template/index.spec.js
```

Note: `src/app/queries/*.spec.ts` files that import from `@models/` also fall here — apply the same fix.

#### Category D — Config/setup specs (update or delete)

- `src/config/mongo.spec.ts` — tests the Mongo connection class; **delete** (class is deleted in this task).
- `src/setup/database.spec.ts` — update to remove Mongo connect assertions; keep Postgres connect coverage.

### Step 1: Update dependencies.js — flip reads

For each model, replace:
```js
new DualWriteRepository(new DatabaseXRepository(), new PrismaXDatabaseRepository(), { asyncSecondary: false })
```
with:
```js
new PrismaXDatabaseRepository()
```

### Step 2: Update repository files

Remove the `Database*Repository` class from each repository file. Keep `Prisma*DatabaseRepository` and its export.

### Step 3: Delete Mongoose models

Delete all 10 model files. Delete `src/app/models/index.ts` if it only exports Mongoose models.

### Step 4: Remove Mongoose config

Delete `src/config/mongo.ts`. Update `src/config/database.ts` to only call `connectPostgres()` — make it fatal if DATABASE_URL is missing (remove the non-fatal try/catch from task-01).

### Step 5: Remove mongoose package

```bash
yarn remove mongoose
```

Confirm no remaining `import mongoose` or `require('mongoose')` references:
```bash
grep -r "mongoose" src --include="*.js" --include="*.ts"
```

Expected: zero results.

### Step 6: Update test infrastructure

- Remove `@shelf/jest-mongodb` from devDependencies if present
- Remove any `mongodb-memory-server` setup
- Update CI to remove MongoDB service from `config.yml`

### Step 7: Run full test suite

```bash
npx jest
```

All specs should pass. Existing specs that used `RepositoryMemory` as Mongoose-backed in-memory repos continue to work because `RepositoryMemory` is kept intact and is independent of Mongoose.

If any spec imports from a deleted model file, update it to import from the Prisma repo or remove the import.

### Step 8: Heroku decommission (human action required — document only)

After confirming tests green and monitoring production for 48h:
1. Remove `MONGODB_URI` from Heroku config vars
2. Decommission the MongoDB Atlas/addon
3. These steps require human action via Heroku dashboard or CLI — document the commands but do NOT execute them.

## Testing

- [ ] Step 0 pre-audit complete — every affected spec file categorised (A/B/C/D)
- [ ] Category A model specs deleted (count should match number of Mongoose model files deleted)
- [ ] Category B Mongoose repository specs deleted; `*.prisma.spec.ts` counterparts from phases 2–3 cover the same paths
- [ ] Category C service/plugin specs updated — `Model.create()` / `Model.findById()` replaced with memory-repo calls; no `@models/` imports remain in these files
- [ ] Category D config specs updated or deleted
- [ ] `grep -r "from.*@models/" src --include="*.spec.js"` returns zero results
- [ ] `npx jest` exits 0 with all tests passing
- [ ] No `mongoose` imports remain in `src/`
- [ ] App boots successfully with only `DATABASE_URL` set (no MONGODB_URI)
- [ ] Smoke test all critical CRUD paths via the API (Licensee create/read, Contact create, Message create)
- [ ] CI workflow passes end-to-end
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Update `docs/kb/architecture/project-overview.md` — change all MongoDB/Mongoose references to PostgreSQL/Prisma
- [ ] Update `docs/kb/architecture/dependency-injection-runtime-wiring.md` — update repo wiring description for Prisma
- [ ] Run `check-kb-index`
- [ ] Add a session handoff or KB doc summarising the completed migration (run `document-solution`)

## Completion Criteria

- [ ] All Mongoose model files deleted
- [ ] All Database*Repository classes deleted
- [ ] mongoose removed from package.json and yarn.lock
- [ ] `grep -r "mongoose" src` returns zero results
- [ ] `grep -r "from.*@models/" src --include="*.spec.js"` returns zero results
- [ ] All 9 Prisma repos (+ RedisTrafficlightRepository) are the sole DB implementations
- [ ] `connectPostgres()` is the only DB connect call; fatal if missing DATABASE_URL
- [ ] `npx jest` exits 0
- [ ] CI passes
- [ ] Changes committed to `plan/mongo-to-postgres/phase-4/task-09-flip-reads-remove-mongo` branch
- [ ] Status updated in `status.md`
