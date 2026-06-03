# Task: Schema migrations (WhatsappSession, Room, Licensee)

**Plan**: Setores
**Phase**: 1
**Task ID (phase-local)**: task-02
**Task Path**: phase-1/task-02-schema-migrations
**Depends On**: None
**JIRA**: N/A

## Objective

Add `setor` field to `WhatsappSession` and `Room`, change the `WhatsappSession` unique index from `{ licensee }` to `{ licensee, setor }`, and add `useSetores` flag to `Licensee`.

## Context

**`WhatsappSession` — the critical change:**

The current schema has `unique: true` on `licensee`, enforcing one session per licensee. With sectors, each sector can have its own Baileys number, meaning multiple sessions per licensee are valid. The new uniqueness constraint is `{ licensee, setor }` — one session per (licensee + sector pair). Null `setor` represents the main licensee number.

MongoDB handles null values in compound unique indexes: two documents with `{ licensee: X, setor: null }` would violate uniqueness. To allow exactly one null-sector session per licensee, use a **partial unique index** (Mongoose: `partialFilterExpression`) or rely on application-level enforcement. The simplest approach: keep the application code ensuring only one session with `setor: null` per licensee via `loadOrCreateSession()` logic.

**Migration is non-destructive:** existing sessions have no `setor` field — Mongoose treats missing fields as `undefined`/`null` by default, so existing records remain valid after the schema change. No data migration script is needed.

**`Room`:**
Adding `setor` as an optional ObjectId reference. Existing rooms have no sector — they remain `null` and represent licensee-level (visible to all) conversations.

**`Licensee`:**
Adding `useSetores: { type: Boolean, default: false }`. Existing licensees default to `false` — no behavioral change until explicitly enabled.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/setores/phase-1/task-02-schema-migrations`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Read `src/app/models/WhatsappSession.ts` (full file)
- [ ] Read `src/app/models/Room.ts` (full file)
- [ ] Read `src/app/models/Licensee.ts` (scan for existing field patterns)
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/models/WhatsappSession.ts` | modify | Add `setor`, change unique index |
| `src/app/models/WhatsappSession.spec.ts` | modify | Add index and field tests |
| `src/app/models/Room.ts` | modify | Add `setor` field |
| `src/app/models/Room.spec.ts` | modify | Add field test |
| `src/app/models/Licensee.ts` | modify | Add `useSetores` flag |
| `src/app/models/Licensee.spec.ts` | modify | Add flag test |

### Do NOT Modify

- `src/app/models/Setor.ts` — owned by phase-1/task-01-setor-model-api
- `src/app/repositories/whatsappsession.ts` — read-only (no changes needed to repository layer)
- `src/app/services/BaileysSocketManager.ts` — owned by phase-2/task-03

## Implementation Steps

### Step 1: Update `WhatsappSession.ts`

Replace:
```js
licensee: {
  type: ObjectId,
  ref: 'Licensee',
  required: [true, 'Licensee: Você deve preencher o campo'],
},
```

With:
```js
licensee: {
  type: ObjectId,
  ref: 'Licensee',
  required: [true, 'Licensee: Você deve preencher o campo'],
},
setor: {
  type: ObjectId,
  ref: 'Setor',
  default: null,
},
```

Remove the inline `unique: true` from the `licensee` field. Add a compound index after the schema definition:

```js
whatsappSessionSchema.index({ licensee: 1, setor: 1 }, { unique: true })
```

> MongoDB allows multiple documents with `null` values on a unique compound index field only when using a **sparse** index. Since we want exactly one null-sector session per licensee, enforce this at the application layer in `Baileys.ts` `loadOrCreateSession()` (ensure `findFirst({ licensee, setor: null })` before creating). The compound index prevents duplicate `(licensee, setor)` pairs for non-null sectors.

### Step 2: Update `Room.ts`

Add after the `contact` field:
```js
setor: {
  type: ObjectId,
  ref: 'Setor',
  default: null,
},
```

### Step 3: Update `Licensee.ts`

Add `useSetores` with the other feature flags (near `useChatbot`, `useSenderName`):
```js
useSetores: { type: Boolean, default: false },
```

## Testing

- [ ] `WhatsappSession`: two sessions with the same `licensee` and `setor: null` — second create should fail (application-level guard test)
- [ ] `WhatsappSession`: two sessions with the same `licensee` but different non-null `setor` values — both should succeed
- [ ] `WhatsappSession`: existing session without `setor` field defaults to `null`
- [ ] `Room`: `setor` field defaults to `null` on new rooms
- [ ] `Licensee`: `useSetores` defaults to `false`
- [ ] All existing model tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc updates required at this task

## Completion Criteria

- [ ] All three models updated as described
- [ ] Compound index added to `WhatsappSession`
- [ ] All tests pass: `npx jest src/app/models/`
- [ ] `npx eslint src/app/models/` passes
- [ ] Changes committed to `plan/setores/phase-1/task-02-schema-migrations` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-01 creates `Setor.ts` but does not touch `WhatsappSession.ts`, `Room.ts`, or `Licensee.ts`. No conflict.
