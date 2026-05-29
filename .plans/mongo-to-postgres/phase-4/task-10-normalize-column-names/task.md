# Task: Normalize column names to snake_case

**Plan**: MongoDB → PostgreSQL Migration
**Phase**: 4
**Task ID (phase-local)**: task-10
**Task Path**: phase-4/task-10-normalize-column-names
**Depends On**: phase-4/task-09-flip-reads-remove-mongo
**JIRA**: N/A

## Objective

Add `@map("snake_case")` directives to every camelCase field in `prisma/schema.prisma`, run the generated migration (which issues `ALTER TABLE ... RENAME COLUMN ...` statements), and verify the application still works. No application code changes are required — Prisma's `@map` keeps the Prisma client API camelCase while the Postgres columns become snake_case.

## Context

Mongoose model field names are camelCase (`apiToken`, `whatsappDefault`, etc.). The current Prisma schema inherited these names verbatim, so Postgres columns are also camelCase. PostgreSQL convention is snake_case.

Prisma resolves this cleanly: adding `@map("api_token")` to a field named `apiToken` keeps the generated client property as `apiToken` while the database column becomes `api_token`. No changes to repositories, use cases, or controllers are needed.

The `@@map("table_name")` table-level mapping is already present on all models (added when the schemas were first written). This task only adds field-level `@map()` directives.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-4/task-09-flip-reads-remove-mongo/status.md` is `complete`
- [ ] Confirm Mongoose is fully removed — `grep -r "mongoose" src` should return zero results
- [ ] Check this task's `status.md`; mark `in-progress`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `prisma/schema.prisma` | modify | Add `@map()` to all camelCase fields |
| `prisma/migrations/` | modify | New migration with RENAME COLUMN statements |

### Do NOT Modify

- Any file in `src/app/` — `@map()` is transparent to application code
- `src/app/repositories/repository.js` — no changes needed

## Implementation Steps

### Step 1: Add @map() directives to prisma/schema.prisma

For every camelCase field, add `@map("snake_case_equivalent")`. Use the full mapping table below.

**Conversion rule**: insert underscore before each uppercase letter, lowercase the result.
Special cases: `waId` → `wa_id`, `talkingWithChatBot` → `talking_with_chatbot`, `useFileIDYcloud` → `use_file_id_ycloud`.

Also add `@map("created_at")` and `@map("updated_at")` to every `createdAt`/`updatedAt` field.

#### Full field mapping (52 fields + timestamps)

| Prisma field | DB column (`@map`) | Table(s) |
|---|---|---|
| `apiToken` | `api_token` | licensees |
| `licenseKind` | `license_kind` | licensees |
| `useChatbot` | `use_chatbot` | licensees |
| `chatbotDefault` | `chatbot_default` | licensees |
| `chatbotUrl` | `chatbot_url` | licensees |
| `chatbotApiToken` | `chatbot_api_token` | licensees |
| `messageOnResetChatbot` | `message_on_reset_chatbot` | licensees |
| `messageOnCloseChat` | `message_on_close_chat` | licensees |
| `chatbotAuthorizationToken` | `chatbot_authorization_token` | licensees |
| `whatsappDefault` | `whatsapp_default` | licensees |
| `whatsappToken` | `whatsapp_token` | licensees |
| `whatsappUrl` | `whatsapp_url` | licensees |
| `chatDefault` | `chat_default` | licensees |
| `chatUrl` | `chat_url` | licensees |
| `chatKey` | `chat_key` | licensees |
| `chatIdentifier` | `chat_identifier` | licensees |
| `cartDefault` | `cart_default` | licensees |
| `useCartGallabox` | `use_cart_gallabox` | licensees |
| `unidadeId` | `unidade_id` | licensees |
| `statusId` | `status_id` | licensees |
| `useWhatsappWindow` | `use_whatsapp_window` | licensees |
| `productFractionals` | `product_fractionals` | licensees |
| `useSenderName` | `use_sender_name` | licensees |
| `useFileIDYcloud` | `use_file_id_ycloud` | licensees |
| `isAdmin` | `is_admin` | users |
| `isSuper` | `is_super` | users |
| `talkingWithChatBot` | `talking_with_chatbot` | contacts |
| `isGroup` | `is_group` | contacts |
| `landbotId` | `landbot_id` | contacts |
| `chatwootId` | `chatwoot_id` | contacts |
| `chatwootSourceId` | `chatwoot_source_id` | contacts |
| `waId` | `wa_id` | contacts, messages |
| `fromMe` | `from_me` | messages |
| `fileName` | `file_name` | messages |
| `senderName` | `sender_name` | messages |
| `messageWaId` | `message_wa_id` | messages |
| `attachmentWaId` | `attachment_wa_id` | messages |
| `sendedAt` | `sended_at` | messages |
| `readAt` | `read_at` | messages |
| `deliveredAt` | `delivered_at` | messages |
| `messageChatId` | `message_chat_id` | messages |
| `replyMessageId` | `reply_message_id` | messages |
| `roomId` | `room_id` | rooms |
| `closedAt` | `closed_at` | rooms |
| `headerParams` | `header_params` | templates |
| `bodyParams` | `body_params` | templates |
| `footerParams` | `footer_params` | templates |
| `triggerKind` | `trigger_kind` | triggers |
| `catalogId` | `catalog_id` | triggers |
| `catalogMulti` | `catalog_multi` | triggers |
| `catalogSingle` | `catalog_single` | triggers |
| `textReplyButton` | `text_reply_button` | triggers |
| `messagesList` | `messages_list` | triggers |
| `expiresAt` | `expires_at` | trafficlights |
| `createdAt` | `created_at` | all tables with timestamps |
| `updatedAt` | `updated_at` | all tables with timestamps |

Example after edit (Licensee excerpt):
```prisma
model Licensee {
  id        Int    @id @default(autoincrement())
  mongo_id  String @unique @db.VarChar(24) @map("mongo_id")
  name      String
  apiToken  String @unique @map("api_token")
  licenseKind String @map("license_kind")
  useChatbot  Boolean @default(false) @map("use_chatbot")
  // ...
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("licensees")
}
```

### Step 2: Run the migration

```bash
npx prisma migrate dev --name normalize-column-names
```

Prisma generates `ALTER TABLE ... RENAME COLUMN ...` for every `@map()` change. Review the generated SQL before applying. The migration file is committed as-is.

### Step 3: Verify application still works

Because `@map()` is purely a database-level rename, all Prisma client calls using `prisma.licensee.findFirst({ where: { apiToken: ... } })` continue to work — Prisma translates `apiToken` to `api_token` in the generated SQL automatically.

Run the full test suite:
```bash
npx jest
```

### Step 4: Spot-check in psql

```sql
-- Confirm api_token column exists (not apiToken)
SELECT column_name FROM information_schema.columns
WHERE table_name = 'licensees' AND column_name = 'api_token';

-- Confirm old camelCase name is gone
SELECT column_name FROM information_schema.columns
WHERE table_name = 'licensees' AND column_name = 'apiToken';
-- should return 0 rows
```

## Testing

- [ ] `npx prisma migrate dev --name normalize-column-names` generates a migration with `RENAME COLUMN` statements for all 52+ fields
- [ ] Migration applies without error
- [ ] `npx jest` exits 0 (no application code changes needed — Prisma handles mapping)
- [ ] psql spot-check confirms snake_case columns exist and camelCase names are gone
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No new KB doc required — `@map()` is standard Prisma; the change is self-evident in the schema
- [ ] Update `docs/kb/architecture/project-overview.md` if it references any column names by name

## Completion Criteria

- [ ] All 52+ camelCase fields have `@map("snake_case")` in `prisma/schema.prisma`
- [ ] All `createdAt`/`updatedAt` fields mapped to `created_at`/`updated_at`
- [ ] Migration file committed
- [ ] All tests pass with no changes to application code
- [ ] Changes committed to `plan/mongo-to-postgres/phase-4/task-10-normalize-column-names` branch
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

task-11 (resync native IDs) references FK column names in its SQL. After this task, those columns will have snake_case names — task-11 must use `snake_case` names in its `ALTER TABLE ... RENAME COLUMN` and FK constraint SQL (e.g. `licensee_id` not `licenseeId`, `contact_id` not `contactId`). The task-11 SQL in its current form already uses snake_case so no changes to task-11 are required.
