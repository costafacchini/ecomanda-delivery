# Task: Migrate WhatsappSession + Body to PostgreSQL; Trafficlight to Redis

**Plan**: MongoDB → PostgreSQL Migration
**Phase**: 3
**Task ID (phase-local)**: task-06
**Task Path**: phase-3/task-06-whatsappsession-body-trafficlight-pg
**Depends On**: phase-2/task-03-licensee-pg
**JIRA**: N/A

## Objective

Add WhatsappSession and Body Prisma models to `schema.prisma`, implement their repositories, and wire dual-write. Migrate Trafficlight to **Redis** (not PostgreSQL): Redis has native TTL (`EXPIREAT`) that directly replaces MongoDB's TTL index, is already available via BullMQ, and is faster for the ephemeral key/token lookups Trafficlight performs.

## Context

**WhatsappSession** — Fields: id, licensee (unique FK → Licensee), creds (JSONB), keys (JSONB). The creds/keys objects hold Baileys session credentials; store as JSONB verbatim. `@unique` on `licensee` deferred to task-11 (enforced after FK column becomes an integer).

**Body** — Fields: id, content (JSONB), licensee (FK → Licensee), kind (enum: normal | webhook | pedidos10), concluded. Content is the raw incoming webhook payload; always JSONB.

**Trafficlight** — Fields: key, token, expiresAt. No FK references. MongoDB's TTL index auto-deletes on `expiresAt`. Redis replicates this natively with `EXPIREAT` — no cleanup job required. Because Trafficlight records are short-lived and ephemeral, there is **no dual-write window and no sync script** — the Mongoose-based repo is replaced directly with `RedisTrafficlightRepository`.

BullMQ already depends on `ioredis`, which is available in the project. Trafficlight will reuse the same Redis connection.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-2/task-03-licensee-pg/status.md` is `complete`
- [ ] Read `src/app/models/WhatsappSession.js`, `src/app/models/Body.js`, `src/app/models/Trafficlight.js`
- [ ] Read `src/app/repositories/whatsappsession.js`, `src/app/repositories/trafficlight.js`
- [ ] Check if `src/config/redis.js` (or similar) already exports a shared Redis client; if so, reuse it
- [ ] Confirm `REDIS_URL` env var is set (same one used by BullMQ)
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `prisma/schema.prisma` | modify | Add WhatsappSession and Body models only — Trafficlight is NOT added |
| `prisma/migrations/` | modify | New migration for WhatsappSession + Body |
| `src/app/repositories/whatsappsession.js` | modify | Add PrismaWhatsappSessionDatabaseRepository |
| `src/app/repositories/body.js` | modify | Add PrismaBodyDatabaseRepository |
| `src/app/repositories/trafficlight.js` | modify | Add RedisTrafficlightRepository; keep DatabaseTrafficlightRepository for dual-write in dependencies.js until task-09 |
| `src/app/repositories/index.js` | modify | Export new repos |
| `src/runtime/dependencies.js` | modify | Wrap WhatsappSession + Body with DualWriteRepository; replace Trafficlight with RedisTrafficlightRepository directly |
| `src/config/redis.js` | create (if absent) | Shared ioredis client singleton |
| `src/scripts/sync-whatsappsession.js` | create | Bulk sync |
| `src/scripts/sync-body.js` | create | Bulk sync |

### Do NOT Modify

- Files owned by task-04, task-05, task-07
- `src/app/models/WhatsappSession.js`, `Body.js`, `Trafficlight.js`
- No `CleanExpiredTrafficlights.js` job needed — Redis handles TTL natively

## Implementation Steps

### Step 1: Add WhatsappSession and Body to schema.prisma

**WhatsappSession:**
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

Trafficlight gets **no Prisma model** — it lives in Redis.

### Step 2: Run migration

```bash
npx prisma migrate dev --name add-whatsappsession-body
```

### Step 3: Implement Prisma repos for WhatsappSession and Body

Standard pattern extending `PrismaRepository`. No special pre-save logic.

For `PrismaWhatsappSessionDatabaseRepository`, expose a `findByLicensee(licenseeMongoId)` helper if the existing Mongoose repo has one (pass `{ where: { licensee: licenseeMongoId } }` to `findFirst`).

### Step 4: Create shared Redis client (if not already present)

Check whether `src/config/redis.js` (or the BullMQ queue config) already exports an `ioredis` instance. If not, create it:

```js
import Redis from 'ioredis'

let client

function getRedisClient() {
  if (!client) {
    client = new Redis(process.env.REDIS_URL, { lazyConnect: false })
  }
  return client
}

export { getRedisClient }
```

Use the same `REDIS_URL` that BullMQ uses. Do NOT create a second Redis connection if one is already wired.

### Step 5: Implement RedisTrafficlightRepository

Redis key schema: `trafficlight:{key}` → JSON blob `{ key, token, expiresAt }`.
TTL is set with `EXAT` (Unix timestamp in seconds), which auto-deletes the key at `expiresAt` — exactly replicating the MongoDB TTL index.

```js
import { getRedisClient } from '../../config/redis.js'

const PREFIX = 'trafficlight:'

class RedisTrafficlightRepository {
  #redis() { return getRedisClient() }
  #redisKey(key) { return `${PREFIX}${key}` }

  async findFirst({ where = {} } = {}) {
    const raw = await this.#redis().get(this.#redisKey(where.key))
    return raw ? JSON.parse(raw) : null
  }

  async save(document) {
    const { key, token, expiresAt } = document
    const expireAt = Math.ceil(new Date(expiresAt).getTime() / 1000)
    await this.#redis().set(this.#redisKey(key), JSON.stringify({ key, token, expiresAt }), 'EXAT', expireAt)
    return document
  }

  async delete({ where = {} } = {}) {
    await this.#redis().del(this.#redisKey(where.key))
  }

  // find() used for bulk queries — Redis doesn't support range scans without SCAN;
  // if the existing Mongoose repo exposes find() with filters beyond key, review usage.
  async find({ where = {} } = {}) {
    const result = await this.findFirst({ where })
    return result ? [result] : []
  }
}

export { RedisTrafficlightRepository }
```

### Step 6: Wire in dependencies.js

WhatsappSession and Body follow the standard `DualWriteRepository` pattern. Trafficlight is wired **directly** (no dual-write, no Mongo fallback):

```js
// WhatsappSession and Body — dual-write
const whatsappSessionRepo = new DualWriteRepository(
  new DatabaseWhatsappSessionRepository(),
  new PrismaWhatsappSessionDatabaseRepository(),
  { asyncSecondary: true }
)

const bodyRepo = new DualWriteRepository(
  new DatabaseBodyRepository(),
  new PrismaBodyDatabaseRepository(),
  { asyncSecondary: true }
)

// Trafficlight — direct Redis (no dual-write, ephemeral data)
const trafficlightRepo = new RedisTrafficlightRepository()
```

### Step 7: Sync scripts for WhatsappSession and Body

Follow the established pattern from task-03. No sync script for Trafficlight — records are ephemeral and any Mongo records will expire naturally.

## Testing

- [ ] Existing specs for whatsappsession and body pass
- [ ] New `whatsappsession.prisma.spec.js`: create + read + assert fields, skip if no DATABASE_URL
- [ ] New `body.prisma.spec.js`: create + read + assert fields, skip if no DATABASE_URL
- [ ] New `trafficlight.redis.spec.js`: save a record with a future `expiresAt`, assert `findFirst` returns it; advance time or use a past `expiresAt`, assert `findFirst` returns null (use `ioredis-mock` or a real Redis with a 1-second TTL)
- [ ] `npx jest` exits 0
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Add a note to `docs/kb/architecture/project-overview.md` (or a new doc) that Trafficlight uses Redis, not PostgreSQL — it is non-obvious that this one model sits outside the Prisma schema

## Completion Criteria

- [ ] WhatsappSession and Body in schema.prisma, migration committed
- [ ] PrismaWhatsappSessionDatabaseRepository and PrismaBodyDatabaseRepository implemented and dual-write wired
- [ ] RedisTrafficlightRepository implemented and wired directly in dependencies.js
- [ ] Shared Redis client singleton created (or reusing existing one)
- [ ] Sync scripts for WhatsappSession and Body committed (no Trafficlight sync script)
- [ ] Tests pass
- [ ] Branch `plan/mongo-to-postgres/phase-3/task-06-whatsappsession-body-trafficlight-pg` committed
- [ ] Status updated in `status.md`

## Impact on Downstream Tasks

- **task-08 (bulk-sync-validate)**: Trafficlight is excluded from the sync + validation report. Note this explicitly when running `sync-all.js` — it syncs 9 models, not 10.
- **task-09 (flip-reads-remove-mongo)**: Delete `DatabaseTrafficlightRepository` from `trafficlight.js` as part of the Mongoose cleanup. `RedisTrafficlightRepository` is already the live implementation by then.
- **task-10 (normalize)**: Trafficlight has no Prisma model — no `@map()` directives needed.
- **task-11 (resync-native-ids)**: Trafficlight has no Postgres table and no `mongo_id` column — excluded from all resync SQL.

## Conflict Avoidance Notes

Same Phase 3 parallel conflict warning as task-04 and task-05 — `prisma/schema.prisma` and `dependencies.js` will have merge conflicts. Resolve by keeping all model blocks and all DualWriteRepository wiring. Note that Trafficlight is intentionally absent from `schema.prisma`.
