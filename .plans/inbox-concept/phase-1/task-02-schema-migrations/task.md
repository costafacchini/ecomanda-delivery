# Task: Schema migrations (WhatsappSession, Room, Message, Body, Department)

**Plan**: inbox-concept
**Phase**: 1
**Task ID (phase-local)**: task-02
**Task Path**: phase-1/task-02-schema-migrations
**Spec References**: Story 2 partial (P1) — FR-007, FR-008, FR-009; Story 3 partial (P1) — FR-009
**Depends On**: None
**JIRA**: N/A

## Objective

Update five existing Mongoose schemas to carry the `inbox` reference that the rest of the plan depends on. No new models — only additive nullable field additions, plus the WhatsappSession schema change from `department` to `inbox`.

## Context

These are additive schema changes — all new fields are nullable so existing documents remain valid without a data backfill. The exception is `WhatsappSession`: its unique index changes from `{ licensee, department }` to `{ licensee, inbox }`, which requires the migration task (phase-3/task-05) to backfill `inbox` before the old index can be dropped.

Key references:
- `src/app/models/WhatsappSession.ts` — replace `department: ObjectId` with `inbox: ObjectId`; change unique index
- `src/app/models/Room.ts` — add `inbox: ObjectId (ref: 'Inbox', nullable)`
- `src/app/models/Message.ts` — add `inbox: ObjectId (ref: 'Inbox', nullable)`
- `src/app/models/Body.ts` — add `inbox: ObjectId (ref: 'Inbox', nullable)` (async job bridge)
- `src/app/models/Department.ts` — add `inbox: ObjectId (ref: 'Inbox', nullable)`; validation: must be `kind='messenger'` and same licensee
- `src/app/models/Department.spec.ts` — extend tests for new `inbox` field

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Read `src/app/models/WhatsappSession.ts` — understand current `department` field and unique index
- [ ] Read `src/app/models/Department.ts` — understand current schema before adding field
- [ ] Read `src/app/models/Room.ts` and `Message.ts` — understand FK pattern
- [ ] Mark task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/models/WhatsappSession.ts` | modify | Replace `department` with `inbox`; change unique index |
| `src/app/models/WhatsappSession.spec.ts` | modify | Update tests for new `inbox` field and index |
| `src/app/models/Room.ts` | modify | Add `inbox: ObjectId` nullable FK |
| `src/app/models/Room.spec.ts` | modify | Add inbox field test |
| `src/app/models/Message.ts` | modify | Add `inbox: ObjectId` nullable FK |
| `src/app/models/Body.ts` | modify | Add `inbox: ObjectId` nullable FK |
| `src/app/models/Department.ts` | modify | Add `inbox: ObjectId` nullable FK |
| `src/app/models/Department.spec.ts` | modify | Add inbox FK test stub |

### Do NOT Modify

- `src/app/models/Inbox.ts` — owned by phase-1/task-01-inbox-model-api
- `src/app/controllers/DepartmentsController.ts` — owned by phase-2/task-04-plugin-factory
- `src/app/routes/resources-routes.ts` — owned by phase-1/task-01-inbox-model-api

## Implementation Steps

### Step 1: WhatsappSession schema (`src/app/models/WhatsappSession.ts`)

Replace:
```typescript
department: { type: Schema.Types.ObjectId, ref: 'Department', default: null }
```
With:
```typescript
inbox: { type: Schema.Types.ObjectId, ref: 'Inbox', default: null }
```

Change the compound unique index from:
```typescript
WhatsappSessionSchema.index({ licensee: 1, department: 1 }, { unique: true })
```
To:
```typescript
WhatsappSessionSchema.index({ licensee: 1, inbox: 1 }, { unique: true })
```

Update `WhatsappSession.spec.ts` to replace all `department` references with `inbox`.

### Step 2: Department schema (`src/app/models/Department.ts`)

Add a nullable FK:
```typescript
inbox: { type: Schema.Types.ObjectId, ref: 'Inbox', default: null }
```
No validation required at the Mongoose level — validation (inbox must be kind='messenger' and same licensee) is enforced in the controller.

### Step 3: Room schema (`src/app/models/Room.ts`)

Add:
```typescript
inbox: { type: Schema.Types.ObjectId, ref: 'Inbox', default: null }
```

### Step 4: Message schema (`src/app/models/Message.ts`)

Add:
```typescript
inbox: { type: Schema.Types.ObjectId, ref: 'Inbox', default: null }
```

### Step 5: Body schema (`src/app/models/Body.ts`)

Add:
```typescript
inbox: { type: Schema.Types.ObjectId, ref: 'Inbox', default: null }
```
Body is the async job bridge — it carries context through the BullMQ pipeline. Adding `inbox` here ensures it is available in worker jobs.

## Testing

**Spec scenarios covered**:
- [ ] Story 2 / Scenario 1 — `department.inbox` field exists and can be set → `src/app/models/Department.spec.ts`
- [ ] Story 3 / Scenario 3 (partial) — `Room.inbox` and `Message.inbox` fields exist as nullable → model spec files

**Additional verification**:
- [ ] `WhatsappSession` can be created with `inbox: null` (backward compat — existing docs)
- [ ] `WhatsappSession` unique index prevents two sessions with same `{ licensee, inbox }`
- [ ] `WhatsappSession.department` references are fully removed from schema and specs
- [ ] All existing tests still pass: `npx jest`

## Documentation / KB Updates

- [ ] No new KB doc required — these are additive schema changes following established patterns
- [ ] Note: the WhatsappSession index change has production implications; document in the migration script (task-05)

## Completion Criteria

- [ ] All five schemas updated with correct field additions
- [ ] WhatsappSession `department` → `inbox` and index updated
- [ ] All spec stubs for this task pass
- [ ] `npx jest` green
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- task-01 creates the `Inbox` model that these schemas reference. Since both tasks run in parallel in Phase 1, use a string ref `'Inbox'` in `ref` — Mongoose resolves it lazily at runtime.
- Do not modify `InboxesController.ts` or any routes — that is task-01 territory.
