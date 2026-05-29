# Task: Resolve FK columns to native PG ids, drop mongo_id

**Plan**: MongoDB → PostgreSQL Migration
**Phase**: 4
**Task ID (phase-local)**: task-10
**Task Path**: phase-4/task-10-resync-native-ids
**Depends On**: phase-4/task-09-flip-reads-remove-mongo
**JIRA**: N/A

## Objective

Replace every `VARCHAR(24)` FK column (which currently holds a MongoDB ObjectId string) with the corresponding Postgres integer `id`, add proper integer FK constraints, update the Prisma schema to reflect the final relational model, and drop all `mongo_id` columns. After this task, the database has no trace of MongoDB identifiers.

## Context

At this point:
- Mongoose is fully removed (task-09 complete)
- All reads and writes go through Prisma
- Every table has `id SERIAL` (Postgres PK) and `mongo_id VARCHAR(24)` (cross-reference)
- Every FK column (`licensee`, `contact`, `room`, `trigger` etc.) still holds a `VARCHAR(24)` Mongo ObjectId string

The resync is a SQL migration that:
1. Adds a new integer FK column alongside each existing VARCHAR FK column
2. Populates it by joining on `mongo_id`
3. Drops the old VARCHAR FK column and renames the new one
4. Drops all `mongo_id` columns
5. Adds FK constraints

**This is a schema-breaking migration — run on staging first and validate before production.**

FK dependency order for the migration:
1. `licensees` — no FKs (root)
2. `users`, `contacts`, `templates`, `triggers`, `whatsapp_sessions`, `bodies` — FK to `licensees`
3. `rooms` — FK to `contacts`
4. `trafficlights` — no FKs
5. `messages` — FKs to `licensees`, `contacts`, `rooms`, `triggers`

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-4/task-09-flip-reads-remove-mongo/status.md` is `complete`
- [ ] Verify all `mongo_id` columns exist in all 10 tables (run `\d+ tablename` in psql)
- [ ] Run on a staging DB clone first — this migration is irreversible
- [ ] Back up production DB before running in production
- [ ] Check this task's `status.md`; mark `in-progress`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `prisma/schema.prisma` | modify | Replace VARCHAR FK columns with Int + add relations; remove mongo_id from all models |
| `prisma/migrations/` | modify | New migration with the resync SQL |
| `src/app/repositories/*.js` | modify | Remove any `mongo_id` references; update `findFirst`/`find` params to use integer ids |
| `src/app/repositories/repository.js` | modify | Remove `#toWhere` mongo_id translation; simplify to standard Prisma id lookups |

### Do NOT Modify

- Application logic in use cases or controllers — they should be unaffected (they use the repo interface, not raw ids)

## Implementation Steps

### Step 1: Write the resync migration SQL

Create `prisma/migrations/<timestamp>_resync-native-ids/migration.sql` manually (or use `npx prisma migrate dev --name resync-native-ids` and fill in the SQL).

For each table with FK columns, use this pattern (example: `contacts.licensee`):

```sql
-- 1. Add new integer FK column
ALTER TABLE "contacts" ADD COLUMN "licensee_id" INTEGER;

-- 2. Populate from the mongo_id cross-reference
UPDATE "contacts" c
SET "licensee_id" = l.id
FROM "licensees" l
WHERE l.mongo_id = c.licensee;

-- 3. Verify no NULLs remain (required column)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "contacts" WHERE "licensee_id" IS NULL AND "licensee" IS NOT NULL) THEN
    RAISE EXCEPTION 'contacts.licensee_id has NULLs after resync — check mongo_id integrity';
  END IF;
END $$;

-- 4. Set NOT NULL, drop old column, rename
ALTER TABLE "contacts" ALTER COLUMN "licensee_id" SET NOT NULL;
ALTER TABLE "contacts" DROP COLUMN "licensee";
ALTER TABLE "contacts" RENAME COLUMN "licensee_id" TO "licensee";

-- 5. Add FK constraint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_licensee_fkey"
  FOREIGN KEY ("licensee") REFERENCES "licensees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

Repeat for every FK column across all tables. Full list:

| Table | Column | References | Nullable? |
|-------|--------|------------|-----------|
| users | licensee | licensees.id | YES |
| contacts | licensee | licensees.id | NO |
| rooms | contact | contacts.id | NO |
| templates | licensee | licensees.id | NO |
| triggers | licensee | licensees.id | NO |
| whatsapp_sessions | licensee | licensees.id | NO |
| bodies | licensee | licensees.id | NO |
| messages | licensee | licensees.id | NO |
| messages | contact | contacts.id | NO |
| messages | room | rooms.id | YES |
| messages | trigger | triggers.id | YES |

### Step 2: Drop all mongo_id columns

```sql
ALTER TABLE "licensees" DROP COLUMN "mongo_id";
ALTER TABLE "users" DROP COLUMN "mongo_id";
ALTER TABLE "contacts" DROP COLUMN "mongo_id";
ALTER TABLE "rooms" DROP COLUMN "mongo_id";
ALTER TABLE "templates" DROP COLUMN "mongo_id";
ALTER TABLE "triggers" DROP COLUMN "mongo_id";
ALTER TABLE "whatsapp_sessions" DROP COLUMN "mongo_id";
ALTER TABLE "bodies" DROP COLUMN "mongo_id";
ALTER TABLE "trafficlights" DROP COLUMN "mongo_id";
ALTER TABLE "messages" DROP COLUMN "mongo_id";
```

### Step 3: Update prisma/schema.prisma to reflect final state

Replace `mongo_id String @unique @db.VarChar(24)` with nothing (remove it).

Replace `VARCHAR(24)` FK fields with typed Prisma relations:

```prisma
model Contact {
  id       Int      @id @default(autoincrement())
  licensee Int
  // ...

  licenseeRef Licensee @relation(fields: [licensee], references: [id])
}
```

Use Prisma's standard relation syntax. Run `npx prisma generate` after updating the schema.

### Step 4: Simplify PrismaRepository base class

Now that `mongo_id` is gone, the `#toWhere` Mongo ObjectId translation is no longer needed. Update `PrismaRepository` in `src/app/repositories/repository.js`:
- Remove the `#toWhere` helper that mapped `_id` → `mongo_id`
- `findFirst`, `find`, `update`, `delete` now use the standard integer `id`
- `save` upserts on `id` (not `mongo_id`)

### Step 5: Run migration

```bash
# Staging first
DATABASE_URL=<staging-url> npx prisma migrate deploy

# Validate on staging
node src/scripts/validate-pg.js

# Production (only after staging passes)
DATABASE_URL=<prod-url> npx prisma migrate deploy
```

## Testing

- [ ] Resync migration runs without errors on staging
- [ ] All FK constraints pass (no orphaned references)
- [ ] `npx jest` exits 0 with simplified `PrismaRepository` (no mongo_id references)
- [ ] `SELECT column_name FROM information_schema.columns WHERE table_name = 'licensees' AND column_name = 'mongo_id'` returns 0 rows
- [ ] Critical read paths return correct data (licensee.contacts, message.contact, etc.)
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Update `docs/kb/architecture/project-overview.md` — note migration complete, native Postgres integer PKs
- [ ] Run `document-solution` — the full migration lifecycle is worth documenting as a KB entry
- [ ] Run `check-kb-index`

## Completion Criteria

- [ ] All FK columns are `INTEGER` with FK constraints
- [ ] All `mongo_id` columns dropped
- [ ] `prisma/schema.prisma` reflects the clean final relational model
- [ ] `PrismaRepository` uses integer `id` everywhere (no `mongo_id` references)
- [ ] Migration deployed to production
- [ ] All tests pass
- [ ] Changes committed to `plan/mongo-to-postgres/phase-4/task-10-resync-native-ids` branch
- [ ] Status updated in `status.md`
