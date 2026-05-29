# Task: Migrate Licensee to PostgreSQL (pilot)

**Plan**: MongoDB → PostgreSQL Migration
**Phase**: 2
**Task ID (phase-local)**: task-03
**Task Path**: phase-2/task-03-licensee-pg
**Depends On**: phase-1/task-01-prisma-setup, phase-1/task-02-dual-write-pattern
**JIRA**: N/A

## Objective

Add the `Licensee` table to `prisma/schema.prisma`, run the migration, implement `PrismaLicenseeDatabaseRepository`, wire it through `DualWriteRepository` in `dependencies.js`, and validate the full dual-write cycle in production. This is the pilot migration — it proves the pattern works end-to-end before scaling to all other models.

## Context

Licensee is the root entity. Every other model holds a foreign key reference to it. It has:
- 40+ fields including strings, booleans, enums, numbers, and two `Object` fields (`productFractionals`, `pedidos10_integration`) → stored as JSONB
- Pre-save hook that sets `whatsappUrl` defaults based on `whatsappDefault` enum — this logic moves into `PrismaLicenseeDatabaseRepository.create()` and `update()`
- Virtual fields (`urlChatWebhook`, `urlWhatsappWebhook`, `urlChatbotWebhook`, `urlChatbotTransfer`) — NOT stored; computed in the repository's `toViewModel()` helper

Current repo: `src/app/repositories/licensee.js` (Mongoose `DatabaseLicenseeRepository`)
Current model: `src/app/models/Licensee.js`
DI wiring: `src/runtime/dependencies.js`

Architecture docs:
- `docs/kb/architecture/dependency-injection-runtime-wiring.md`
- `docs/kb/architecture/project-overview.md`

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-1/task-01-prisma-setup/status.md` is `complete`
- [ ] Verify `phase-1/task-02-dual-write-pattern/status.md` is `complete`
- [ ] Check this task's `status.md` — if `in-progress` or `complete`, stop and investigate
- [ ] Read `src/app/models/Licensee.js` and `src/app/repositories/licensee.js` in full
- [ ] Read `src/runtime/dependencies.js` to understand current wiring
- [ ] Read `docs/kb/architecture/dependency-injection-runtime-wiring.md`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `prisma/schema.prisma` | modify | Add Licensee model |
| `prisma/migrations/` | modify | New migration file for Licensee table |
| `src/app/repositories/licensee.js` | modify | Add `PrismaLicenseeDatabaseRepository` class at bottom; do NOT change `DatabaseLicenseeRepository` |
| `src/runtime/dependencies.js` | modify | Wrap `DatabaseLicenseeRepository` with `DualWriteRepository` |
| `src/app/repositories/index.js` | modify | Export `PrismaLicenseeDatabaseRepository` |
| `src/scripts/sync-licensee.js` | create | One-off bulk sync script (Mongo → Postgres) |

### Do NOT Modify

- `src/app/models/Licensee.js` — Mongoose model remains unchanged
- `src/app/repositories/repository.js` — owned by phase-1/task-02

## Implementation Steps

### Step 1: Add Licensee to prisma/schema.prisma

```prisma
model Licensee {
  id                        String   @id @db.VarChar(24)
  name                      String
  email                     String?
  phone                     String?
  active                    Boolean  @default(true)
  apiToken                  String   @unique
  licenseKind               String
  useChatbot                Boolean  @default(false)
  chatbotDefault            String?
  chatbotUrl                String?
  chatbotApiToken           String?
  messageOnResetChatbot     String?
  messageOnCloseChat        String?
  chatbotAuthorizationToken String?
  whatsappDefault           String?
  whatsappToken             String?
  whatsappUrl               String?
  chatDefault               String?
  chatUrl                   String?
  chatKey                   String?
  chatIdentifier            String?
  cartDefault               String?
  useCartGallabox           Boolean  @default(false)
  unidadeId                 String?
  statusId                  String?
  useWhatsappWindow         Boolean  @default(false)
  productFractional2Name    String?
  productFractional2Id      String?
  productFractional3Name    String?
  productFractional3Id      String?
  productFractionalSize3Name String?
  productFractionalSize3Id  String?
  productFractionalSize4Name String?
  productFractionalSize4Id  String?
  productFractionals        Json?
  document                  String?
  kind                      String?
  financial_player_fee      Float?
  holder_name               String?
  bank                      String?
  branch_number             String?
  branch_check_digit        String?
  account_number            String?
  account_check_digit       String?
  holder_kind               String?
  holder_document           String?
  account_type              String?
  recipient_id              String?
  card_information_url      String?
  pedidos10_active          Boolean  @default(false)
  pedidos10_integration     Json?
  pedidos10_integrator      String?
  useSenderName             Boolean  @default(false)
  useFileIDYcloud           Boolean  @default(false)
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt

  @@map("licensees")
}
```

Note: enum fields (`licenseKind`, `whatsappDefault`, etc.) are stored as `String` to avoid Prisma enum migration friction during the dual-write window. Constraints can be tightened post-cutover.

### Step 2: Run migration

```bash
npx prisma migrate dev --name add-licensee
```

Commit the generated migration file.

### Step 3: Implement PrismaLicenseeDatabaseRepository

Add to `src/app/repositories/licensee.js`:

```js
import { PrismaRepository } from './repository.js'
import { getPrismaClient } from '../../config/postgres.js'

class PrismaLicenseeDatabaseRepository extends PrismaRepository {
  delegate() {
    return getPrismaClient().licensee
  }

  async create(fields = {}) {
    const prepared = this.#applyDefaults(fields)
    return await this.delegate().create({ data: this.#toRecord(prepared) })
  }

  async update(id, fields = {}) {
    const prepared = this.#applyDefaults(fields)
    return await this.delegate().update({ where: { id: id.toString() }, data: prepared })
  }

  // Computed virtual URLs (mirrors Mongoose virtual fields)
  toViewModel(record) {
    if (!record) return record
    return {
      ...record,
      urlChatWebhook: `https://clave-digital.herokuapp.com/api/v1/chat/message/?token=${record.apiToken}`,
      urlChatbotWebhook: `https://clave-digital.herokuapp.com/api/v1/chatbot/message/?token=${record.apiToken}`,
      urlChatbotTransfer: `https://clave-digital.herokuapp.com/api/v1/chatbot/transfer/?token=${record.apiToken}`,
      urlWhatsappWebhook: `https://clave-digital.herokuapp.com/api/v1/messenger/message/?token=${record.apiToken}`,
    }
  }

  // Mirrors Licensee pre-save hook logic
  #applyDefaults(fields) {
    const data = { ...fields }
    if (data.whatsappDefault === 'utalk') data.whatsappUrl = 'https://v1.utalk.chat/send/'
    if (data.whatsappDefault === 'dialog') data.whatsappUrl = 'https://waba.360dialog.io/'
    if (data.whatsappDefault === 'ycloud') data.whatsappUrl = 'https://api.ycloud.com/v2/'
    return data
  }

  // Maps Mongoose _id → Prisma id
  #toRecord(fields) {
    const { _id, __v, ...rest } = fields
    return { id: (_id ?? rest.id)?.toString(), ...rest }
  }
}

export { PrismaLicenseeDatabaseRepository }
```

### Step 4: Wire DualWriteRepository in dependencies.js

In `src/runtime/dependencies.js`, replace the current `DatabaseLicenseeRepository` instantiation:

```js
import { DatabaseLicenseeRepository } from '../app/repositories/licensee.js'
import { PrismaLicenseeDatabaseRepository } from '../app/repositories/licensee.js'
import { DualWriteRepository } from '../app/repositories/repository.js'

// Replace:
//   const licenseeRepository = new DatabaseLicenseeRepository()
// With:
const licenseeRepository = new DualWriteRepository(
  new DatabaseLicenseeRepository(),
  new PrismaLicenseeDatabaseRepository(),
  { asyncSecondary: true } // fire-and-forget during pilot
)
```

### Step 5: Create bulk sync script

Create `src/scripts/sync-licensee.js`:
```js
// One-off sync: copies all Licensee documents from MongoDB to PostgreSQL
// Run with: node src/scripts/sync-licensee.js
import { connect } from '../config/database.js'
import Licensee from '../app/models/Licensee.js'
import { PrismaLicenseeDatabaseRepository } from '../app/repositories/licensee.js'

async function sync() {
  await connect()
  const repo = new PrismaLicenseeDatabaseRepository()
  const docs = await Licensee.find({})
  let created = 0, skipped = 0

  for (const doc of docs) {
    const plain = doc.toObject({ depopulate: true, versionKey: false, virtuals: false })
    const { _id, __v, ...rest } = plain
    const id = _id.toString()
    const existing = await repo.findFirst({ id })
    if (existing) { skipped++; continue }
    await repo.create({ id, ...rest })
    created++
  }

  console.log(`Sync complete: ${created} created, ${skipped} skipped`)
  process.exit(0)
}

sync().catch((err) => { console.error(err); process.exit(1) })
```

## Testing

- [ ] `src/app/repositories/licensee.spec.js` still passes (tests use `RepositoryMemory`, unaffected)
- [ ] Write a new integration test `src/app/repositories/licensee.prisma.spec.js` that:
  - Creates a licensee via `PrismaLicenseeDatabaseRepository`
  - Reads it back and asserts fields match
  - Tests that `#applyDefaults` sets `whatsappUrl` when `whatsappDefault = 'dialog'`
  - Skips if `DATABASE_URL` is not set (use `test.skipIf`)
- [ ] `DualWriteRepository` integration: create a licensee via the dual-write repo and assert both stores contain it
- [ ] `npx jest` exits 0
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Run `document-solution` — first Prisma model + DualWrite wiring is a non-obvious pattern worth documenting
- [ ] Run `check-kb-index` after KB doc created

## Completion Criteria

- [ ] `prisma/schema.prisma` has Licensee model
- [ ] Migration file committed
- [ ] `PrismaLicenseeDatabaseRepository` implemented and exported
- [ ] `dependencies.js` wires `DualWriteRepository` for Licensee
- [ ] `sync-licensee.js` script committed
- [ ] All tests pass
- [ ] Changes committed to `plan/mongo-to-postgres/phase-2/task-03-licensee-pg` branch
- [ ] Status updated in `status.md`
