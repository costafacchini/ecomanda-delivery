# Task: Migrate Room + Template + Trigger to PostgreSQL

**Plan**: MongoDB → PostgreSQL Migration
**Phase**: 3
**Task ID (phase-local)**: task-05
**Task Path**: phase-3/task-05-room-template-trigger-pg
**Depends On**: phase-2/task-03-licensee-pg
**JIRA**: N/A

## Objective

Add Room, Template, and Trigger Prisma models to `schema.prisma`, run migrations, implement their `Prisma*DatabaseRepository` classes, wire through `DualWriteRepository`, and add sync scripts.

## Context

**Room** — Fields: id, roomId, token, closed, closedAt, contact (VARCHAR 24 → Contact). No pre-save business logic beyond ID generation.

**Template** — Fields: id, name, namespace, language, category, waId, licensee (FK → Licensee), headerParams/bodyParams/footerParams as JSONB arrays, active. No complex pre-save logic.

**Trigger** — Fields: id, name, triggerKind (enum: multi_product | single_product | reply_button | list_message | text), expression, catalogId, catalogSingle, catalogMulti, textReplyButton, messagesList, licensee (FK → Licensee), and more — read the full model file. Conditional required fields on enums stay as application-layer validation (not Postgres constraints during dual-write window).

All FK columns (contact, licensee) are `VARCHAR(24)` with no constraint during Phase 3. Constraints added in task-08.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-2/task-03-licensee-pg/status.md` is `complete`
- [ ] Read `src/app/models/Room.js`, `src/app/models/Template.js`, `src/app/models/Trigger.js` in full
- [ ] Read `src/app/repositories/room.js`, `src/app/repositories/template.js`, `src/app/repositories/trigger.js`
- [ ] Check this task's `status.md` before proceeding
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `prisma/schema.prisma` | modify | Add Room, Template, Trigger models |
| `prisma/migrations/` | modify | New migration |
| `src/app/repositories/room.js` | modify | Add PrismaRoomDatabaseRepository |
| `src/app/repositories/template.js` | modify | Add PrismaTemplateDatabaseRepository |
| `src/app/repositories/trigger.js` | modify | Add PrismaTriggerDatabaseRepository |
| `src/app/repositories/index.js` | modify | Export new Prisma repos |
| `src/runtime/dependencies.js` | modify | Wrap Room, Template, Trigger with DualWriteRepository |
| `src/scripts/sync-room.js` | create | Bulk sync |
| `src/scripts/sync-template.js` | create | Bulk sync |
| `src/scripts/sync-trigger.js` | create | Bulk sync |

### Do NOT Modify

- `src/app/repositories/licensee.js`, `user.js`, `contact.js`, `message.js`, `whatsappsession.js`, `body.js`, `trafficlight.js`
- `src/app/models/Room.js`, `Template.js`, `Trigger.js`

## Implementation Steps

### Step 1: Add Room to schema.prisma

`id` is SERIAL; `mongo_id` for cross-reference; `contact` stays `VARCHAR(24)` during migration.

```prisma
model Room {
  id        Int       @id @default(autoincrement())
  mongo_id  String    @unique @db.VarChar(24)
  roomId    String?
  token     String?
  closed    Boolean   @default(false)
  closedAt  DateTime?
  contact   String    @db.VarChar(24)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("rooms")
}
```

### Step 2: Add Template to schema.prisma

```prisma
model Template {
  id           Int      @id @default(autoincrement())
  mongo_id     String   @unique @db.VarChar(24)
  name         String
  namespace    String?
  language     String?
  category     String?
  waId         String?
  licensee     String   @db.VarChar(24)
  headerParams Json?
  bodyParams   Json?
  footerParams Json?
  active       Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("templates")
}
```

### Step 3: Add Trigger to schema.prisma

Read `src/app/models/Trigger.js` in full before writing this model. Add all fields as nullable Strings where Mongoose uses conditional required.

```prisma
model Trigger {
  id              Int      @id @default(autoincrement())
  mongo_id        String   @unique @db.VarChar(24)
  name            String?
  triggerKind     String
  expression      String
  catalogId       String?
  catalogMulti    String?
  catalogSingle   String?
  textReplyButton String?
  messagesList    String?
  licensee        String   @db.VarChar(24)
  // ... add all remaining fields from Trigger.js
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("triggers")
}
```

### Step 4: Run migration

```bash
npx prisma migrate dev --name add-room-template-trigger
```

### Step 5: Implement Prisma repos

For each model, follow the same pattern as `PrismaLicenseeDatabaseRepository`:
- Extend `PrismaRepository`
- Override `delegate()` to return the correct Prisma model delegate
- No special pre-save logic for Room or Template
- Trigger: no pre-save business logic beyond ID — no override needed

### Step 6: Wire DualWriteRepository and write sync scripts

Follow the same pattern established in task-03 for all three repositories.

## Testing

- [ ] Existing specs for room, template, trigger pass
- [ ] New `*.prisma.spec.js` for each: create record, read back, assert fields match (skip if no DATABASE_URL)
- [ ] `npx jest` exits 0
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No new KB doc required — pattern is established

## Completion Criteria

- [ ] Room, Template, Trigger in schema.prisma, migration committed
- [ ] All three Prisma repos implemented and dual-write wired
- [ ] Sync scripts committed
- [ ] Tests pass
- [ ] Branch `plan/mongo-to-postgres/phase-3/task-05-room-template-trigger-pg` committed
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- Phase 3 tasks run in parallel and all touch `prisma/schema.prisma` and `dependencies.js`. Each task appends its own model blocks. Merge conflicts in these files are resolved by keeping all blocks.
- `dependencies.js` is edited by task-04, task-05, task-06, task-07 simultaneously. If editing on separate branches, expect a merge conflict — resolve by keeping all DualWriteRepository wiring.
