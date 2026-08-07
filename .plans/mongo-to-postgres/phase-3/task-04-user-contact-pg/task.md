# Task: Migrate User + Contact + Inbox to PostgreSQL

**Plan**: MongoDB → PostgreSQL Migration
**Phase**: 3
**Task ID (phase-local)**: task-04
**Task Path**: phase-3/task-04-user-contact-pg
**Depends On**: phase-2/task-03-licensee-pg
**JIRA**: N/A

## Objective

Add User, Contact, and Inbox Prisma models to `schema.prisma`, run migrations, implement their `Prisma*DatabaseRepository` classes, wire through `DualWriteRepository` in `dependencies.ts`, and add sync scripts.

## Context

**User** model:
- Fields: id (VARCHAR 24), name, email (unique), password (bcrypt hashed — do NOT re-hash), active, isAdmin, isSuper, licensee (FK → Licensee)
- Pre-save hook runs bcrypt on password changes — this logic moves to `PrismaUserDatabaseRepository.create()`; `update()` should only hash if password field is present in the update payload

**Contact** model:
- Fields: id, name, number, type, talkingWithChatBot, email, licensee (FK → Licensee), waId, isGroup, active, landbotId, chatwootId, chatwootSourceId, address fields, delivery_tax, plugin_cart_id, wa_start_chat, document, customer_id, address_id, credit_card_id, credit_cards[] → JSONB
- Pre-save hook normalises phone number (`NormalizePhone`) and strips non-numeric from CEP — this logic moves to the Prisma repo's `create()`

**Inbox** model:
- Fields: id, name, licensee (FK → Licensee), kind (enum: messenger|chat), whatsappDefault, whatsappToken, whatsappUrl, chatDefault, chatUrl, chatKey, chatIdentifier, inboxToken (uuid, unique), active
- Pre-validate hook generates `inboxToken = uuidv4()` if missing — this moves to `PrismaInboxDatabaseRepository.create()`
- `webhookUrl` is a computed virtual field — **NOT stored in Postgres**; computed in the application layer as it was in Mongoose

All FK columns (licensee) are `VARCHAR(24)` with no constraint during Phase 3. FK constraint added in task-08.

The `NormalizePhone` helper lives at `src/app/helpers/NormalizePhone.ts`. Re-use it as-is in the Prisma repo.

Existing repos: `src/app/repositories/user.ts`, `src/app/repositories/contact.ts`, `src/app/repositories/inbox.ts`

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-2/task-03-licensee-pg/status.md` is `complete`
- [ ] Check sibling tasks task-05, task-06, task-07 status — they also run in Phase 3 but own different files
- [ ] Read `src/app/models/User.ts`, `src/app/models/Contact.ts`, `src/app/models/Inbox.ts` in full
- [ ] Read `src/app/repositories/user.ts`, `src/app/repositories/contact.ts`, `src/app/repositories/inbox.ts`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `prisma/schema.prisma` | modify | Add User, Contact, Inbox models |
| `prisma/migrations/` | modify | New migration for user + contact + inbox tables |
| `src/app/repositories/user.ts` | modify | Add `PrismaUserDatabaseRepository` |
| `src/app/repositories/contact.ts` | modify | Add `PrismaContactDatabaseRepository` |
| `src/app/repositories/inbox.ts` | modify | Add `PrismaInboxDatabaseRepository` |
| `src/app/repositories/index.ts` | modify | Export all three new Prisma repos |
| `src/app/runtime/dependencies.ts` | modify | Wrap User, Contact, Inbox repos with DualWriteRepository |
| `src/scripts/sync-user.ts` | create | Bulk sync script |
| `src/scripts/sync-contact.ts` | create | Bulk sync script |
| `src/scripts/sync-inbox.ts` | create | Bulk sync script |

### Do NOT Modify

- `src/app/repositories/licensee.ts` — owned by task-03
- `src/app/models/User.ts`, `src/app/models/Contact.ts`, `src/app/models/Inbox.ts` — unchanged
- Files owned by task-05, task-06, task-07 (Room, Template, Trigger, Department, WhatsappSession, Body, Trafficlight, Message repos)

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

### Step 3: Add Inbox to schema.prisma

`webhookUrl` is a computed virtual — do NOT store it.

```prisma
model Inbox {
  id              Int      @id @default(autoincrement())
  mongo_id        String   @unique @db.VarChar(24)
  name            String
  licensee        String   @db.VarChar(24)
  kind            String
  whatsappDefault String   @default("")
  whatsappToken   String?
  whatsappUrl     String?
  chatDefault     String   @default("")
  chatUrl         String?
  chatKey         String?
  chatIdentifier  String?
  inboxToken      String   @unique
  active          Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("inboxes")
}
```

### Step 4: Run migration

```bash
npx prisma migrate dev --name add-user-contact-inbox
```

### Step 5: Implement PrismaUserDatabaseRepository

In `src/app/repositories/user.ts`, add:
- Override `create()` to bcrypt-hash the password if provided (check `src/app/models/User.ts` for saltRounds = 14)
- Override `update()` to only hash password if `fields.password` is present
- Map `_id` → `id` in create/save

### Step 6: Implement PrismaContactDatabaseRepository

In `src/app/repositories/contact.ts`, add:
- Override `create()` to run `NormalizePhone` on number and strip non-numeric from CEP
- Override `update()` to run normalisation if number or CEP is in the update payload
- Store `credit_cards` as-is (JSONB)

### Step 7: Implement PrismaInboxDatabaseRepository

In `src/app/repositories/inbox.ts`, add:
- Override `create()` to generate `inboxToken = uuidv4()` if not provided (mirrors pre-validate hook)
- Do NOT compute or store `webhookUrl` — it is computed in the application layer

### Step 8: Wire all three in dependencies.ts

Wrap `DatabaseUserRepository`, `DatabaseContactRepository`, and `DatabaseInboxRepository` each with `DualWriteRepository` (asyncSecondary: true).

### Step 9: Write sync scripts

Follow the same pattern as `sync-licensee.ts` for User, Contact, and Inbox.

## Testing

- [ ] Existing `user.spec.ts` and `contact.spec.ts` pass (RepositoryMemory unaffected)
- [ ] New `user.prisma.spec.ts`: creates user, verifies password is hashed in PG, skips if no DATABASE_URL
- [ ] New `contact.prisma.spec.ts`: creates contact with phone normalisation, verifies number is normalised in PG
- [ ] New `inbox.prisma.spec.ts`: creates inbox, verifies `inboxToken` is generated, skips if no DATABASE_URL
- [ ] `npx jest` exits 0
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No new KB doc required — pattern established in task-03 pilot doc
- [ ] If any edge case (bcrypt in Prisma repo) is notably non-obvious, append a note to the existing KB doc

## Completion Criteria

- [ ] User + Contact + Inbox in schema.prisma, migration committed
- [ ] All three Prisma repos implemented and dual-write wired
- [ ] Sync scripts committed
- [ ] All tests pass
- [ ] Changes committed to `plan/mongo-to-postgres/phase-3/task-04-user-contact-pg` branch
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- task-05, task-06, task-07 run in parallel. They also modify `prisma/schema.prisma`, `dependencies.ts`, and `index.ts`. Each task appends its own model block; do not overwrite other tasks' additions. If merge conflicts arise in these files, resolve by keeping all blocks.
- Coordinate with task-05 on `prisma/schema.prisma` — if both run at the same time, run `npx prisma migrate dev` only after all Phase 3 schema additions are merged, or run them on separate branches and merge before migrating.
