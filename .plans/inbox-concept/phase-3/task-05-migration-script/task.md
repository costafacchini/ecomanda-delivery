# Task: MongoDB migration script — Licensee config → Inbox records

**Plan**: inbox-concept
**Phase**: 3
**Task ID (phase-local)**: task-05
**Task Path**: phase-3/task-05-migration-script
**Spec References**: Story 4 (P2) — FR-011; all FR-001 through FR-010 (validation gate)
**Depends On**: phase-2/task-03-auth-routing, phase-2/task-04-plugin-factory
**JIRA**: N/A

## Objective

Write and verify an idempotent migration script that:
1. Creates one messenger Inbox per licensee that has `whatsappDefault` set
2. Creates one chat Inbox per licensee that has `chatDefault` set
3. For each department with an existing `WhatsappSession` (department-scoped, i.e. `session.department` exists in old data), creates a messenger Inbox and links it to that department; updates the session to use `inbox`
4. Does not create duplicates on re-run

## Context

This is a MongoDB data migration — not a Mongoose model file. Write it as a standalone script in `src/setup/migrations/` (follow any existing migration scripts in that directory; if none exist, create the directory and follow the Node + Mongoose connection pattern from `server.ts`).

The migration runs after all Phase 1 and Phase 2 code is deployed. It bridges the gap between the old licensee-level config and the new inbox-based config.

Key references:
- `src/app/models/Licensee.ts` — fields to read: `whatsappDefault`, `whatsappToken`, `whatsappUrl`, `chatDefault`, `chatUrl`, `chatKey`, `chatIdentifier`
- `src/app/models/Inbox.ts` — model to create records in
- `src/app/models/Department.ts` — model to update `inbox` field
- `src/app/models/WhatsappSession.ts` — model to update `inbox` field (was `department`)
- `src/app/repositories/inbox.ts` — use `InboxRepositoryDatabase` for creation
- `src/config/` — DB connection setup

**CRITICAL**: Do not run this script in production without taking a MongoDB backup first. Provide instructions for the operator.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify phase-2/task-03 and phase-2/task-04 status.md both show `complete`
- [ ] Check `src/setup/migrations/` — understand any existing migration conventions
- [ ] Read `src/app/models/Licensee.ts` — confirm current field names
- [ ] Mark task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/setup/migrations/001-licensee-config-to-inboxes.ts` | create | The migration script |
| `src/setup/migrations/001-licensee-config-to-inboxes.spec.ts` | create | Tests against in-memory MongoDB |

### Do NOT Modify

- Any model files — owned by Phase 1 tasks
- Any route or controller files — owned by Phase 2 tasks
- Any production DB directly — provide operator instructions only

## Implementation Steps

### Step 1: Script structure

```typescript
// src/setup/migrations/001-licensee-config-to-inboxes.ts
// Usage: npx ts-node src/setup/migrations/001-licensee-config-to-inboxes.ts

async function migrate() {
  await connectToDatabase()
  
  const licensees = await Licensee.find({})
  
  for (const licensee of licensees) {
    // 1. Messenger inbox
    if (licensee.whatsappDefault) {
      const exists = await Inbox.findOne({ licensee: licensee._id, kind: 'messenger' })
      if (!exists) {
        await Inbox.create({
          name: `WhatsApp — ${licensee.name}`,
          licensee: licensee._id,
          kind: 'messenger',
          whatsappDefault: licensee.whatsappDefault,
          whatsappToken: licensee.whatsappToken,
          whatsappUrl: licensee.whatsappUrl,
          active: true,
        })
      }
    }
    
    // 2. Chat inbox
    if (licensee.chatDefault) {
      const exists = await Inbox.findOne({ licensee: licensee._id, kind: 'chat' })
      if (!exists) {
        await Inbox.create({
          name: `Chat — ${licensee.name}`,
          licensee: licensee._id,
          kind: 'chat',
          chatDefault: licensee.chatDefault,
          chatUrl: licensee.chatUrl,
          chatKey: licensee.chatKey,
          chatIdentifier: licensee.chatIdentifier,
          active: true,
        })
      }
    }
  }
  
  // 3. Department WhatsappSession migration
  // Note: WhatsappSession.department field was the old schema.
  // After task-02, the field is `inbox`. During the migration window,
  // query the raw collection to find sessions that have a `department` field set
  // but no `inbox` field set yet.
  const sessions = await WhatsappSession.collection.find({
    department: { $exists: true, $ne: null },
    inbox: { $exists: false }
  }).toArray()
  
  for (const session of sessions) {
    const department = await Department.findById(session.department)
    if (!department) continue
    
    // Create an inbox for this department if not already linked
    let inbox = department.inbox
      ? await Inbox.findById(department.inbox)
      : null
    
    if (!inbox) {
      inbox = await Inbox.create({
        name: `WhatsApp — ${department.name}`,
        licensee: session.licensee,
        kind: 'messenger',
        whatsappDefault: 'baileys',
        active: true,
      })
      await Department.updateOne({ _id: department._id }, { inbox: inbox._id })
    }
    
    // Migrate session to inbox
    await WhatsappSession.collection.updateOne(
      { _id: session._id },
      { $set: { inbox: inbox._id }, $unset: { department: '' } }
    )
  }
  
  console.log('Migration complete')
  process.exit(0)
}
```

### Step 2: Idempotency guard

The `if (!exists)` check before each `Inbox.create()` call ensures the script is safe to re-run. Document this in a comment at the top of the script.

### Step 3: Operator instructions

Add a comment block at the top of the script:
```
// BEFORE RUNNING IN PRODUCTION:
// 1. Take a MongoDB backup: mongodump --uri=<MONGO_URI> --out=backup-$(date +%Y%m%d)
// 2. Run on staging first: npx ts-node src/setup/migrations/001-licensee-config-to-inboxes.ts
// 3. Verify inbox counts match expected: db.inboxes.count()
// 4. Run in production with the same command
```

## Testing

**Spec scenarios covered**:
- [ ] Story 4 / Scenario 1 — Licensee with whatsappDefault='baileys' → messenger inbox created → `src/setup/migrations/001-licensee-config-to-inboxes.spec.ts`
- [ ] Story 4 / Scenario 2 — Licensee with chatDefault='local' → chat inbox created → `src/setup/migrations/001-licensee-config-to-inboxes.spec.ts`
- [ ] Story 4 / Scenario 3 — Department with WhatsappSession (department-scoped) → inbox created, session.inbox set, department.inbox set → `src/setup/migrations/001-licensee-config-to-inboxes.spec.ts`
- [ ] Story 4 / Scenario 4 — Licensee with no plugin config → no inbox created → `src/setup/migrations/001-licensee-config-to-inboxes.spec.ts`
- [ ] Story 4 / Scenario 5 — Running migration twice → no duplicate inboxes → `src/setup/migrations/001-licensee-config-to-inboxes.spec.ts`

**Additional verification**:
- [ ] Script connects to in-memory MongoDB in tests (follow existing `mongoServer.connect()` pattern)
- [ ] All existing tests still pass: `npx jest`

## Documentation / KB Updates

- [ ] Add operator instructions as a comment block at the top of the migration script
- [ ] No new KB doc needed — migration is one-time and self-documenting

## Completion Criteria

- [ ] Migration script creates correct Inbox records for all configured licensees
- [ ] Department WhatsappSessions migrated to inbox-based sessions
- [ ] Script is idempotent — safe to run multiple times
- [ ] All spec scenarios for Story 4 pass
- [ ] `npx jest` green
- [ ] Status updated in `status.md`
