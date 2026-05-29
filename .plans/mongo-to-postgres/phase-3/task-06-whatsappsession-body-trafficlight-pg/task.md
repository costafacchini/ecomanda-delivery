# Task: Migrate WhatsappSession + Body + Trafficlight to PostgreSQL

**Plan**: MongoDB → PostgreSQL Migration
**Phase**: 3
**Task ID (phase-local)**: task-06
**Task Path**: phase-3/task-06-whatsappsession-body-trafficlight-pg
**Depends On**: phase-2/task-03-licensee-pg
**JIRA**: N/A

## Objective

Add WhatsappSession, Body, and Trafficlight Prisma models to `schema.prisma`, implement their repositories, wire dual-write, and implement a Trafficlight TTL cleanup strategy (PostgreSQL has no native TTL index).

## Context

**WhatsappSession** — Fields: id, licensee (unique FK → Licensee), creds (JSONB), keys (JSONB). The creds/keys objects hold Baileys session credentials; store as JSONB verbatim. `unique` constraint on licensee column (one session per licensee).

**Body** — Fields: id, content (JSONB), licensee (FK → Licensee), kind (enum: normal | webhook | pedidos10), concluded. Content is the raw incoming webhook payload; always JSONB.

**Trafficlight** — Fields: id, key, token, expiresAt. **No FK references.** MongoDB uses a TTL index (`expiresAt: 1, expireAfterSeconds: 0`) to auto-delete expired records. Postgres does NOT have TTL indexes. Mitigation: implement a scheduled cleanup job using `node-cron` that runs `DELETE FROM trafficlights WHERE expires_at < NOW()` on a short interval (e.g., every 60 seconds).

Existing repos: `src/app/repositories/whatsappsession.js`, `src/app/repositories/trafficlight.js`
Body repo: check if `src/app/repositories/body.js` exists.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-2/task-03-licensee-pg/status.md` is `complete`
- [ ] Read `src/app/models/WhatsappSession.js`, `src/app/models/Body.js`, `src/app/models/Trafficlight.js`
- [ ] Read the corresponding repository files
- [ ] Check if `node-cron` is already a dependency; if not, look up current version: `npm show node-cron version`
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `prisma/schema.prisma` | modify | Add WhatsappSession, Body, Trafficlight models |
| `prisma/migrations/` | modify | New migration |
| `src/app/repositories/whatsappsession.js` | modify | Add PrismaWhatsappSessionDatabaseRepository |
| `src/app/repositories/body.js` | modify | Add PrismaBodyDatabaseRepository |
| `src/app/repositories/trafficlight.js` | modify | Add PrismaTrafficlightDatabaseRepository |
| `src/app/repositories/index.js` | modify | Export new repos |
| `src/runtime/dependencies.js` | modify | Wrap with DualWriteRepository |
| `src/app/jobs/CleanExpiredTrafficlights.js` | create | Scheduled cleanup job (replaces MongoDB TTL) |
| `src/scripts/sync-whatsappsession.js` | create | Bulk sync |
| `src/scripts/sync-body.js` | create | Bulk sync |
| `src/scripts/sync-trafficlight.js` | create | Bulk sync |

### Do NOT Modify

- Files owned by task-04, task-05, task-07
- `src/app/models/WhatsappSession.js`, `Body.js`, `Trafficlight.js`

## Implementation Steps

### Step 1: Add models to schema.prisma

**WhatsappSession:**

`licensee` stays `VARCHAR(24)` (Mongo ObjectId) during migration. The `@unique` on `licensee` is intentionally NOT added here — it will be enforced after task-10 converts it to an integer FK. During dual-write, uniqueness is guaranteed by Mongo.

```prisma
model WhatsappSession {
  id        Int      @id @default(autoincrement())
  mongo_id  String   @unique @db.VarChar(24)
  licensee  String   @db.VarChar(24)
  creds     Json?
  keys      Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("whatsapp_sessions")
}
```

**Body:**
```prisma
model Body {
  id        Int      @id @default(autoincrement())
  mongo_id  String   @unique @db.VarChar(24)
  content   Json
  licensee  String   @db.VarChar(24)
  kind      String
  concluded Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("bodies")
}
```

**Trafficlight:**
```prisma
model Trafficlight {
  id        Int      @id @default(autoincrement())
  mongo_id  String   @unique @db.VarChar(24)
  key       String
  token     String
  expiresAt DateTime

  @@map("trafficlights")
}
```

Note: Trafficlight has no `timestamps: true` in Mongoose, so no `createdAt`/`updatedAt` needed.

### Step 2: Run migration

```bash
npx prisma migrate dev --name add-whatsappsession-body-trafficlight
```

### Step 3: Implement Prisma repos

Standard pattern. No special pre-save logic for any of the three.

For `PrismaWhatsappSessionDatabaseRepository`, note the `unique` constraint on `licensee` — upsert by licensee is common; expose a `findByLicensee(licenseeId)` helper if the existing MongoDB repo has one.

### Step 4: Implement Trafficlight cleanup job

Install `node-cron` if not present (look up current version first):
```bash
npm show node-cron version
yarn add node-cron
```

Create `src/app/jobs/CleanExpiredTrafficlights.js`:
```js
import cron from 'node-cron'
import { getPrismaClient } from '../../config/postgres.js'

function scheduleTrafficlightCleanup() {
  // Run every 60 seconds — matches MongoDB TTL behavior
  cron.schedule('* * * * *', async () => {
    try {
      const result = await getPrismaClient().trafficlight.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      })
      if (result.count > 0) {
        console.log(`[TrafficlightCleanup] Deleted ${result.count} expired records`)
      }
    } catch (err) {
      console.error('[TrafficlightCleanup] Error:', err.message)
    }
  })
}

export { scheduleTrafficlightCleanup }
```

Wire `scheduleTrafficlightCleanup()` in the server startup (check `src/app.js` or server entry point — call after `connectPostgres()`).

### Step 5: Wire DualWriteRepository and sync scripts

Follow the established pattern from task-03.

## Testing

- [ ] Existing specs for whatsappsession, body, trafficlight pass
- [ ] New `*.prisma.spec.js` for each: create + read + assert (skip if no DATABASE_URL)
- [ ] Trafficlight cleanup job test: mock `getPrismaClient()`, assert `deleteMany` is called with `expiresAt < now`
- [ ] `npx jest` exits 0
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Add a note in `docs/kb/architecture/job-queue-system.md` (or a new doc) describing the Trafficlight TTL replacement strategy — it is non-obvious that the cleanup shifted from a DB index to a cron job

## Completion Criteria

- [ ] Three models in schema.prisma, migration committed
- [ ] All three Prisma repos implemented and dual-write wired
- [ ] Trafficlight cleanup job implemented and wired at startup
- [ ] Sync scripts committed
- [ ] Tests pass
- [ ] Branch `plan/mongo-to-postgres/phase-3/task-06-whatsappsession-body-trafficlight-pg` committed
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

Same Phase 3 parallel conflict warning as task-04 and task-05 — `prisma/schema.prisma` and `dependencies.js` will have merge conflicts. Resolve by keeping all model blocks and all DualWriteRepository wiring.
