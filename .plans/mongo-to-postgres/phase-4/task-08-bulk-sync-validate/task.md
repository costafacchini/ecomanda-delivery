# Task: Bulk-sync all models Mongo→PG + integrity validation

**Plan**: MongoDB → PostgreSQL Migration
**Phase**: 4
**Task ID (phase-local)**: task-08
**Task Path**: phase-4/task-08-bulk-sync-validate
**Depends On**: phase-3/task-04-user-contact-pg, phase-3/task-05-room-template-trigger-pg, phase-3/task-06-whatsappsession-body-trafficlight-pg, phase-3/task-07-message-pg
**JIRA**: N/A

## Objective

Run the bulk sync scripts for all 10 models against production data, produce a validation report (counts + spot-check integrity), add PostgreSQL FK constraints now that referential integrity is confirmed, and promote all `DualWriteRepository` instances from `asyncSecondary: true` (fire-and-forget) to `asyncSecondary: false` (synchronous dual-write) to guarantee no post-sync drift.

## Context

At this point:
- All 10 models have dual-write active (Mongo primary, Postgres secondary, async)
- Production data has been accumulating in Postgres since each Phase 3 task was deployed
- There will be records that pre-date Phase 3 deployment that are only in Mongo — those need a bulk back-fill
- There may also be async write failures that caused Mongo/Postgres to diverge

This task does NOT flip reads to Postgres — that is task-09. This task only ensures Postgres is fully populated and consistent.

**Do not run destructive operations on Mongo at any point in this task.**

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify all Phase 3 task statuses are `complete`
- [ ] Confirm `DATABASE_URL` is set in the production Heroku environment
- [ ] Check this task's `status.md`; mark `in-progress`
- [ ] Read `src/scripts/sync-*.js` files written in Phase 2 and 3 to understand the sync pattern

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/scripts/sync-all.js` | create | Orchestrates all sync scripts in dependency order |
| `src/scripts/validate-pg.js` | create | Validation report: count comparisons + spot-checks |
| `prisma/migrations/` | modify | Add FK constraint migration (after validation passes) |
| `src/runtime/dependencies.js` | modify | Change asyncSecondary: true → false for all DualWriteRepository instances |

### Do NOT Modify

- Individual `sync-*.js` scripts — call them as-is
- `src/app/repositories/repository.js` — DualWriteRepository is already implemented

## Implementation Steps

### Step 1: Create sync-all.js orchestrator

```js
// Run: node src/scripts/sync-all.js
// Syncs all models in dependency order: Licensee first, then others, Message last
import './sync-licensee.js'
import './sync-user.js'
import './sync-contact.js'
import './sync-room.js'
import './sync-template.js'
import './sync-trigger.js'
import './sync-whatsappsession.js'
import './sync-body.js'
import './sync-trafficlight.js'
import './sync-message.js'
```

Actually, since each script calls `process.exit()`, run them sequentially via shell or refactor each to be importable without auto-exit. Prefer refactoring sync scripts to export a `sync()` function and call `process.exit()` only in the CLI entrypoint. Then `sync-all.js` can `await` each in order.

### Step 2: Create validate-pg.js

For each model, compare:
1. MongoDB count vs Postgres count — must match within 0.1% tolerance
2. Sample 10 random records from Mongo; verify each exists in Postgres with matching key fields

```js
// Output format: table of model names, mongo count, pg count, drift %, status (OK/WARN/FAIL)
// Exit code 0 if all OK, 1 if any FAIL
```

### Step 3: Run sync + validation in production (human action required)

Document the steps to run:
```bash
heroku run node src/scripts/sync-all.js --app <app-name>
heroku run node src/scripts/validate-pg.js --app <app-name>
```

The agent executing this task should paste the validation output into this task's `status.md` under Artifacts.

**Kill criterion**: if validation shows >0.1% drift on any model after 3 sync attempts, stop and escalate. Do not proceed to FK constraints or task-09.

### Step 4: Verify mongo_id cross-reference integrity

At this stage FK columns still hold Mongo ObjectId strings — do NOT add integer FK constraints yet (that is task-10). Instead, validate that the string references are consistent:

```sql
-- Example: messages whose licensee string does not match any licensee.mongo_id
SELECT COUNT(*) FROM messages m
WHERE NOT EXISTS (SELECT 1 FROM licensees l WHERE l.mongo_id = m.licensee);
```

Run similar queries for all FK columns. Results should be 0 — if not, the bulk sync missed some records. Re-run the relevant sync script before proceeding.

### Step 5: Promote dual-write to synchronous

In `src/runtime/dependencies.js`, change every `DualWriteRepository` instantiation from:
```js
{ asyncSecondary: true }
```
to:
```js
{ asyncSecondary: false }
```

This ensures no further drift can occur between Mongo writes and Postgres writes.

Note: at this point `mongo_id` columns still exist and FK columns are still `VARCHAR(24)`. That cleanup happens in task-10 after Mongoose is fully removed.

### Step 6: Deploy and monitor

Deploy the synchronous dual-write changes. Monitor logs for any `[DualWrite] Secondary write failed` errors — these would indicate a Postgres issue that needs resolution before proceeding to task-09.

## Testing

- [ ] `validate-pg.js` exits 0 with OK status for all 10 models
- [ ] FK constraint migration runs without error on staging and production
- [ ] Synchronous dual-write: add a smoke test that creates a record via the dual-write repo and immediately asserts it exists in both stores
- [ ] `npx jest` exits 0
- [ ] Monitor error logs for 24h after deploying synchronous dual-write

## Documentation / KB Updates

- [ ] Record the validation report output in `status.md` Artifacts section
- [ ] Document the sync approach in KB if not already covered by the pilot KB doc (run `check-kb-index` if KB changes)

## Completion Criteria

- [ ] `sync-all.js` and `validate-pg.js` committed
- [ ] Validation report shows 0 FAIL, ≤ acceptable WARN
- [ ] FK constraint migration committed and deployed
- [ ] All DualWriteRepository instances set to `asyncSecondary: false`
- [ ] No `[DualWrite] Secondary write failed` errors in logs for 24h
- [ ] Changes committed to `plan/mongo-to-postgres/phase-4/task-08-bulk-sync-validate` branch
- [ ] Status updated in `status.md`
