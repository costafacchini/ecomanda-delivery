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

The flip is done by replacing each `DualWriteRepository` with the Prisma repo directly in `dependencies.js`. After the flip, Mongo receives no more writes — it can be kept running as a fallback read store for a short observation window, then decommissioned.

**This task is the point of no return for the Mongo primary write path.** Confirm with the assigned dev before deploying the read flip.

Architecture docs:
- `docs/kb/architecture/dependency-injection-runtime-wiring.md`
- `docs/kb/architecture/project-overview.md`

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-4/task-08-bulk-sync-validate/status.md` is `complete`
- [ ] Confirm validation report in task-08 status.md shows 0 FAIL
- [ ] Confirm no `[DualWrite] Secondary write failed` errors in production logs for 24h post task-08
- [ ] Check this task's `status.md`; mark `in-progress`
- [ ] Read `src/runtime/dependencies.js` in full

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/runtime/dependencies.js` | modify | Replace all DualWriteRepository with Prisma repos |
| `src/app/repositories/index.js` | modify | Remove Database* exports; keep Prisma* and RepositoryMemory |
| `src/app/repositories/repository.js` | modify | Remove DualWriteRepository export; keep PrismaRepository, RepositoryMemory |
| `src/app/repositories/licensee.js` | modify | Delete DatabaseLicenseeRepository; keep PrismaLicenseeDatabaseRepository |
| `src/app/repositories/user.js` | modify | Delete Database* |
| `src/app/repositories/contact.js` | modify | Delete Database* |
| `src/app/repositories/message.js` | modify | Delete Database* |
| `src/app/repositories/room.js` | modify | Delete Database* |
| `src/app/repositories/template.js` | modify | Delete Database* |
| `src/app/repositories/trigger.js` | modify | Delete Database* |
| `src/app/repositories/whatsappsession.js` | modify | Delete Database* |
| `src/app/repositories/body.js` | modify | Delete Database* |
| `src/app/repositories/trafficlight.js` | modify | Delete Database* |
| `src/app/models/Licensee.js` | delete | Mongoose model removed |
| `src/app/models/Contact.js` | delete | Mongoose model removed |
| `src/app/models/Message.js` | delete | Mongoose model removed |
| `src/app/models/Room.js` | delete | Mongoose model removed |
| `src/app/models/Template.js` | delete | Mongoose model removed |
| `src/app/models/Trigger.js` | delete | Mongoose model removed |
| `src/app/models/User.js` | delete | Mongoose model removed |
| `src/app/models/WhatsappSession.js` | delete | Mongoose model removed |
| `src/app/models/Body.js` | delete | Mongoose model removed |
| `src/app/models/Trafficlight.js` | delete | Mongoose model removed |
| `src/app/models/index.js` | delete | No longer needed |
| `src/config/mongo.js` | delete | MongoServer class removed |
| `src/config/database.js` | modify | Remove Mongo connect; keep connectPostgres; make it fatal if DATABASE_URL missing |
| `package.json` | modify | Remove mongoose dependency |
| `jest.config.mjs` | modify | Remove any @shelf/jest-mongodb or mongodb-memory-server setup |
| CI workflow files | modify | Remove MongoDB service from CI; keep Postgres service |

### Do NOT Modify

- `src/app/repositories/repository.js` — keep RepositoryMemory and PrismaRepository (but remove DualWriteRepository)
- Individual spec files that use RepositoryMemory — they continue to work unchanged
- `src/scripts/sync-*.js` — keep for historical reference or archival

## Implementation Steps

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

Delete all 10 model files. Delete `src/app/models/index.js` if it only exports Mongoose models.

### Step 4: Remove Mongoose config

Delete `src/config/mongo.js`. Update `src/config/database.js` to only call `connectPostgres()` — make it fatal if DATABASE_URL is missing (remove the non-fatal try/catch from task-01).

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

- [ ] `npx jest` exits 0 with all tests passing
- [ ] No `mongoose` imports remain in `src/`
- [ ] `grep -r "mongoose" src` returns zero results
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
- [ ] All 10 Prisma repos are the sole DB implementations
- [ ] `connectPostgres()` is the only DB connect call; fatal if missing DATABASE_URL
- [ ] `npx jest` exits 0
- [ ] CI passes
- [ ] Changes committed to `plan/mongo-to-postgres/phase-4/task-09-flip-reads-remove-mongo` branch
- [ ] Status updated in `status.md`
