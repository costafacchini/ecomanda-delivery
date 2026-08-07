# Task: Migrate Room + Template + Trigger + Department to PostgreSQL

**Plan**: MongoDB → PostgreSQL Migration
**Phase**: 3
**Task ID (phase-local)**: task-05
**Task Path**: phase-3/task-05-room-template-trigger-pg
**Depends On**: phase-2/task-03-licensee-pg
**JIRA**: N/A

## Objective

Add Room, Template, Trigger, and Department Prisma models to `schema.prisma`, run migrations, implement their `Prisma*DatabaseRepository` classes, wire through `DualWriteRepository`, and add sync scripts.

## Context

**Room** — Fields: id, roomId, token, closed, closedAt, contact (VARCHAR 24 → Contact). No pre-save business logic beyond ID generation.

**Template** — Fields: id, name, namespace, language, category, waId, licensee (FK → Licensee), headerParams/bodyParams/footerParams as JSONB arrays, active. No complex pre-save logic.

**Trigger** — Fields: id, name, triggerKind (enum: multi_product | single_product | reply_button | list_message | text), expression, catalogId, catalogSingle, catalogMulti, textReplyButton, messagesList, licensee (FK → Licensee), and more — read the full model file. Conditional required fields on enums stay as application-layer validation (not Postgres constraints during dual-write window).

**Department** — Fields: id, name, licensee (FK → Licensee), users (array of FK → User), active, departmentToken (uuid, unique), inbox (optional FK → Inbox).
- `users` is a Mongo array of ObjectId refs. During Phase 3 it is stored as **JSONB** (array of VARCHAR(24) mongo_ids). In task-11 (FK resync), this will need special handling: convert to a `department_users` junction table or a Postgres array of integers.
- Pre-save hook generates `_id` if missing (already handled by PrismaRepository via autoincrement).
- `webhookUrl` is a computed virtual — **NOT stored in Postgres**; computed in the application layer.
- `departmentToken` = `uuidv4()` default — generate in `PrismaDepartmentDatabaseRepository.create()` if not provided.

All FK columns (contact, licensee, inbox) are `VARCHAR(24)` with no constraint during Phase 3. Constraints added in task-08.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-2/task-03-licensee-pg/status.md` is `complete`
- [ ] Read `src/app/models/Room.ts`, `src/app/models/Template.ts`, `src/app/models/Trigger.ts`, `src/app/models/Department.ts` in full
- [ ] Read `src/app/repositories/room.ts`, `src/app/repositories/template.ts`, `src/app/repositories/trigger.ts`, `src/app/repositories/department.ts`
- [ ] Check this task's `status.md` before proceeding
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `prisma/schema.prisma` | modify | Add Room, Template, Trigger, Department models |
| `prisma/migrations/` | modify | New migration |
| `src/app/repositories/room.ts` | modify | Add PrismaRoomDatabaseRepository |
| `src/app/repositories/template.ts` | modify | Add PrismaTemplateDatabaseRepository |
| `src/app/repositories/trigger.ts` | modify | Add PrismaTriggerDatabaseRepository |
| `src/app/repositories/department.ts` | modify | Add PrismaDepartmentDatabaseRepository |
| `src/app/repositories/index.ts` | modify | Export new Prisma repos |
| `src/app/runtime/dependencies.ts` | modify | Wrap Room, Template, Trigger, Department with DualWriteRepository |
| `src/scripts/sync-room.ts` | create | Bulk sync |
| `src/scripts/sync-template.ts` | create | Bulk sync |
| `src/scripts/sync-trigger.ts` | create | Bulk sync |
| `src/scripts/sync-department.ts` | create | Bulk sync |

### Do NOT Modify

- `src/app/repositories/licensee.ts`, `user.ts`, `contact.ts`, `inbox.ts`, `message.ts`, `whatsappsession.ts`, `body.ts`, `trafficlight.ts`
- `src/app/models/Room.ts`, `Template.ts`, `Trigger.ts`, `Department.ts`

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

Read `src/app/models/Trigger.ts` in full before writing this model. Add all fields as nullable Strings where Mongoose uses conditional required.

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
  // ... add all remaining fields from Trigger.ts
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("triggers")
}
```

### Step 4: Add Department to schema.prisma

`users` is stored as JSONB (array of VARCHAR(24) mongo_ids) during migration. Task-11 will convert this to a proper `department_users` junction table when FK resync runs.

```prisma
model Department {
  id              Int      @id @default(autoincrement())
  mongo_id        String   @unique @db.VarChar(24)
  name            String
  licensee        String   @db.VarChar(24)
  users           Json
  active          Boolean  @default(true)
  departmentToken String   @unique
  inbox           String?  @db.VarChar(24)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("departments")
}
```

### Step 5: Run migration

```bash
npx prisma migrate dev --name add-room-template-trigger-department
```

### Step 6: Implement Prisma repos

For Room, Template, Trigger: follow the same pattern as `PrismaLicenseeDatabaseRepository` — extend `PrismaRepository`, override `delegate()`. No special pre-save logic.

For Department: override `create()` to generate `departmentToken = uuidv4()` if not provided. Do NOT compute or store `webhookUrl`.

### Step 7: Wire DualWriteRepository and write sync scripts

Follow the pattern established in task-03 for all four repositories. For the Department sync script, store `users` as a JSON array of mongo_id strings.

## Testing

- [ ] Existing specs for room, template, trigger, department pass
- [ ] New `*.prisma.spec.ts` for each: create record, read back, assert fields match (skip if no DATABASE_URL)
- [ ] `npx jest` exits 0
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No new KB doc required — pattern is established
- [ ] If Department's `users` JSONB approach requires a note for task-11, append to the existing KB migration doc

## Completion Criteria

- [ ] Room, Template, Trigger, Department in schema.prisma, migration committed
- [ ] All four Prisma repos implemented and dual-write wired
- [ ] Sync scripts committed
- [ ] Tests pass
- [ ] Branch `plan/mongo-to-postgres/phase-3/task-05-room-template-trigger-pg` committed
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- Phase 3 tasks run in parallel and all touch `prisma/schema.prisma` and `dependencies.ts`. Each task appends its own model blocks. Merge conflicts in these files are resolved by keeping all blocks.
- `dependencies.ts` is edited by task-04, task-05, task-06, task-07 simultaneously. If editing on separate branches, expect a merge conflict — resolve by keeping all DualWriteRepository wiring.
