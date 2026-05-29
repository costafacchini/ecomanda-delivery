# Task: Migrate Message to PostgreSQL

**Plan**: MongoDB → PostgreSQL Migration
**Phase**: 3
**Task ID (phase-local)**: task-07
**Task Path**: phase-3/task-07-message-pg
**Depends On**: phase-2/task-03-licensee-pg
**JIRA**: N/A

## Objective

Add the Message Prisma model to `schema.prisma`, implement `PrismaMessageDatabaseRepository`, wire through `DualWriteRepository`, and add a sync script. Message is the most complex model — it holds 5 FK references (Licensee, Contact, Room, Trigger, Cart) and several nullable fields.

## Context

**Message** model (`src/app/models/Message.js`):
- References: licensee (req), contact (req), room (opt), trigger (opt)
- Note: `cart` reference in Mongoose model points to Cart — Cart is removed by `remove-pdv`. Do NOT add a `cart` column to the Postgres schema; strip it from sync and dual-write.
- `payload` field is String in Mongoose (JSON stored as string) — map to `Text` or `String` in Prisma
- Enum fields: `kind` (text|file|location|interactive|cart|template), `destination` (to-chatbot|to-chat|to-messenger|to-transfer) — stored as String during migration window
- Fields: number, fromMe, text, url, fileName, kind, destination, latitude, longitude, departament, senderName, sended, licensee, contact, room, trigger, messageWaId, attachmentWaId, sendedAt, readAt, deliveredAt, messageChatId, error, payload, replyMessageId

All FK columns are `VARCHAR(24)` with no constraints enforced during Phase 3.

Existing repo: `src/app/repositories/message.js`

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-2/task-03-licensee-pg/status.md` is `complete`
- [ ] Confirm `remove-pdv` plan has removed the Cart model/repo (or at minimum that Cart fields should not be added to Postgres schema)
- [ ] Read `src/app/models/Message.js` in full
- [ ] Read `src/app/repositories/message.js`
- [ ] Check this task's `status.md`; mark `in-progress`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `prisma/schema.prisma` | modify | Add Message model |
| `prisma/migrations/` | modify | New migration |
| `src/app/repositories/message.js` | modify | Add PrismaMessageDatabaseRepository |
| `src/app/repositories/index.js` | modify | Export new Prisma repo |
| `src/runtime/dependencies.js` | modify | Wrap Message repo with DualWriteRepository |
| `src/scripts/sync-message.js` | create | Bulk sync (skip cart field) |

### Do NOT Modify

- Files owned by task-04, task-05, task-06
- `src/app/models/Message.js`

## Implementation Steps

### Step 1: Add Message to schema.prisma

```prisma
model Message {
  id             String    @id @db.VarChar(24)
  number         String
  fromMe         Boolean   @default(false)
  text           String?
  url            String?
  fileName       String?
  kind           String    @default("text")
  destination    String
  latitude       Float?
  longitude      Float?
  departament    String?
  senderName     String?
  sended         Boolean   @default(false)
  licensee       String    @db.VarChar(24)
  contact        String    @db.VarChar(24)
  room           String?   @db.VarChar(24)
  trigger        String?   @db.VarChar(24)
  messageWaId    String?
  attachmentWaId String?
  sendedAt       DateTime?
  readAt         DateTime?
  deliveredAt    DateTime?
  messageChatId  String?
  error          String?
  payload        String?
  replyMessageId String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@map("messages")
}
```

Note: `cart` reference is intentionally excluded. The `kind` enum value `cart` may still appear in existing data — it is preserved as a String value but the FK is dropped.

### Step 2: Run migration

```bash
npx prisma migrate dev --name add-message
```

### Step 3: Implement PrismaMessageDatabaseRepository

Standard pattern. In `#toRecord()` (or equivalent), explicitly exclude the `cart` field:
```js
const { _id, __v, cart, ...rest } = plain
return { id: _id.toString(), ...rest }
```

### Step 4: Wire DualWriteRepository

Wrap `DatabaseMessageRepository` in dependencies.js. Use `asyncSecondary: true`.

### Step 5: Sync script

In `sync-message.js`, exclude the `cart` field when inserting into Postgres:
```js
const { _id, __v, cart, ...rest } = plain
```

## Testing

- [ ] Existing `message.spec.js` passes
- [ ] New `message.prisma.spec.js`: create message, read back, verify all fields match (skip `cart`), skip if no DATABASE_URL
- [ ] `npx jest` exits 0
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No new KB doc required — cart field exclusion is self-explanatory given remove-pdv

## Completion Criteria

- [ ] Message in schema.prisma (no cart column), migration committed
- [ ] PrismaMessageDatabaseRepository implemented and dual-write wired
- [ ] Sync script committed (excludes cart)
- [ ] Tests pass
- [ ] Branch `plan/mongo-to-postgres/phase-3/task-07-message-pg` committed
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

Same as other Phase 3 tasks — `prisma/schema.prisma`, `index.js`, and `dependencies.js` will have conflicts. Resolve by keeping all model blocks.
