# Task: Migrate User + Contact to PostgreSQL

**Plan**: MongoDB → PostgreSQL Migration
**Phase**: 3
**Task ID (phase-local)**: task-04
**Task Path**: phase-3/task-04-user-contact-pg
**Depends On**: phase-2/task-03-licensee-pg
**JIRA**: N/A

## Objective

Add User and Contact Prisma models to `schema.prisma`, run migrations, implement `PrismaUserDatabaseRepository` and `PrismaContactDatabaseRepository`, wire both through `DualWriteRepository` in `dependencies.js`, and add sync scripts.

## Context

**User** model:
- Fields: id (VARCHAR 24), name, email (unique), password (bcrypt hashed — do NOT re-hash), active, isAdmin, isSuper, licensee (FK → Licensee)
- Pre-save hook runs bcrypt on password changes — this logic moves to `PrismaUserDatabaseRepository.create()`; `update()` should only hash if password field is present in the update payload

**Contact** model:
- Fields: id, name, number, type, talkingWithChatBot, email, licensee (FK → Licensee), waId, isGroup, active, landbotId, chatwootId, chatwootSourceId, address fields, delivery_tax, plugin_cart_id, wa_start_chat, document, customer_id, address_id, credit_card_id, credit_cards[] → JSONB
- Pre-save hook normalises phone number (`NormalizePhone`) and strips non-numeric from CEP — this logic moves to the Prisma repo's `create()`

Both models reference Licensee (`licensee` field). During the dual-write window, this is stored as a plain `VARCHAR(24)` column with **no FK constraint enforced**. FK constraint is added in task-08.

The `NormalizePhone` helper lives at `src/app/helpers/NormalizePhone.js`. Re-use it as-is in the Prisma repo.

Existing repos: `src/app/repositories/user.js`, `src/app/repositories/contact.js`

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-2/task-03-licensee-pg/status.md` is `complete`
- [ ] Check sibling tasks task-05, task-06, task-07 status — they also run in Phase 3 but own different files
- [ ] Read `src/app/models/User.js` and `src/app/models/Contact.js` in full
- [ ] Read `src/app/repositories/user.js` and `src/app/repositories/contact.js`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `prisma/schema.prisma` | modify | Add User + Contact models |
| `prisma/migrations/` | modify | New migration for user + contact tables |
| `src/app/repositories/user.js` | modify | Add `PrismaUserDatabaseRepository` |
| `src/app/repositories/contact.js` | modify | Add `PrismaContactDatabaseRepository` |
| `src/app/repositories/index.js` | modify | Export both new Prisma repos |
| `src/runtime/dependencies.js` | modify | Wrap User + Contact repos with DualWriteRepository |
| `src/scripts/sync-user.js` | create | Bulk sync script |
| `src/scripts/sync-contact.js` | create | Bulk sync script |

### Do NOT Modify

- `src/app/repositories/licensee.js` — owned by task-03
- `src/app/models/User.js`, `src/app/models/Contact.js` — unchanged
- Files owned by task-05, task-06, task-07 (Room, Template, Trigger, WhatsappSession, Body, Trafficlight, Message repos)

## Implementation Steps

### Step 1: Add User to schema.prisma

`id` is SERIAL; `mongo_id` is the cross-reference. `licensee` stays `VARCHAR(24)` during the migration window (holds the Mongo ObjectId of the Licensee).

```prisma
model User {
  id        Int      @id @default(autoincrement())
  mongo_id  String   @unique @db.VarChar(24)
  name      String
  email     String   @unique
  password  String?
  active    Boolean  @default(true)
  isAdmin   Boolean  @default(false)
  isSuper   Boolean  @default(false)
  licensee  String?  @db.VarChar(24)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

### Step 2: Add Contact to schema.prisma

```prisma
model Contact {
  id                  Int       @id @default(autoincrement())
  mongo_id            String    @unique @db.VarChar(24)
  name                String?
  number              String
  type                String?
  talkingWithChatBot  Boolean
  email               String?
  licensee            String    @db.VarChar(24)
  waId                String?
  isGroup             Boolean   @default(false)
  active              Boolean   @default(true)
  landbotId           String?
  chatwootId          String?
  chatwootSourceId    String?
  address             String?
  address_number      String?
  address_complement  String?
  neighborhood        String?
  city                String?
  cep                 String?
  uf                  String?
  delivery_tax        Float?
  plugin_cart_id      String?
  wa_start_chat       DateTime?
  document            String?
  customer_id         String?
  address_id          String?
  credit_card_id      String?
  credit_cards        Json?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@map("contacts")
}
```

### Step 3: Run migration

```bash
npx prisma migrate dev --name add-user-contact
```

### Step 4: Implement PrismaUserDatabaseRepository

In `src/app/repositories/user.js`, add:
- Override `create()` to bcrypt-hash the password if provided (check `src/app/models/User.js` for saltRounds = 14)
- Override `update()` to only hash password if `fields.password` is present
- Map `_id` → `id` in create/save

### Step 5: Implement PrismaContactDatabaseRepository

In `src/app/repositories/contact.js`, add:
- Override `create()` to run `NormalizePhone` on number and strip non-numeric from CEP
- Override `update()` to run normalisation if number or CEP is in the update payload
- Store `credit_cards` as-is (JSONB)

### Step 6: Wire both in dependencies.js

Wrap `DatabaseUserRepository` and `DatabaseContactRepository` each with `DualWriteRepository` (asyncSecondary: true).

### Step 7: Write sync scripts

Follow the same pattern as `sync-licensee.js` for both User and Contact.

## Testing

- [ ] Existing `user.spec.js` and `contact.spec.js` pass (RepositoryMemory unaffected)
- [ ] New `user.prisma.spec.js`: creates user, verifies password is hashed in PG, skips if no DATABASE_URL
- [ ] New `contact.prisma.spec.js`: creates contact with phone normalisation, verifies number is normalised in PG
- [ ] `npx jest` exits 0
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No new KB doc required — pattern established in task-03 pilot doc
- [ ] If any edge case (bcrypt in Prisma repo) is notably non-obvious, append a note to the existing KB doc

## Completion Criteria

- [ ] User + Contact in schema.prisma, migration committed
- [ ] Both Prisma repos implemented and dual-write wired
- [ ] Sync scripts committed
- [ ] All tests pass
- [ ] Changes committed to `plan/mongo-to-postgres/phase-3/task-04-user-contact-pg` branch
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- task-05, task-06, task-07 run in parallel. They also modify `prisma/schema.prisma`, `dependencies.js`, and `index.js`. Each task appends its own model block; do not overwrite other tasks' additions. If merge conflicts arise in these files, resolve by keeping all blocks.
- Coordinate with task-05 on `prisma/schema.prisma` — if both run at the same time, run `npx prisma migrate dev` only after all Phase 3 schema additions are merged, or run them on separate branches and merge before migrating.
