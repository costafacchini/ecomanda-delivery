# Task: Setores & Session Model Interfaces

**Plan**: Backend Type Narrowing
**Phase**: 1
**Task ID (phase-local)**: task-02
**Task Path**: phase-1/task-02-setores-session-model-interfaces
**Depends On**: None
**JIRA**: N/A

## Objective

Apply the existing `IRoom` and `ITrigger` interfaces (already in `src/types/index.ts`) to their Mongoose schema declarations, and define new interfaces for the `setores` models — `IDepartment` and `IInbox` — which were added after the plan was originally created.

## Context

`IRoom` and `ITrigger` already exist in `src/types/index.ts` but their schema files do not yet use the `Schema<I{Model}>` generic. The primary new work is defining `IDepartment` and `IInbox` for the models added by the `setores` plan (merged 2026-07-17).

Note: Cart, Order, and Product were removed by the `remove-pdv` plan (complete 2026-06-05). There is nothing to type for PDV models.

Read `docs/kb/architecture/typescript-conventions.md` before starting.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Read `src/types/index.ts` to see existing `IRoom` and `ITrigger` definitions
- [ ] Read `src/app/models/Department.ts` and `src/app/models/Inbox.ts` for field shapes
- [ ] Read `docs/kb/architecture/typescript-conventions.md`
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/types/index.ts` | modify | Add `IDepartment`, `IInbox`; do not modify existing interfaces |
| `src/app/models/Room.ts` | modify | Apply `Schema<IRoom>` and `model<IRoom>` generics |
| `src/app/models/Trigger.ts` | modify | Apply `Schema<ITrigger>` and `model<ITrigger>` generics |
| `src/app/models/Department.ts` | modify | Define and apply `IDepartment`; fix `any[]` in validator and `(this.licensee as any)` |
| `src/app/models/Inbox.ts` | modify | Define and apply `IInbox`; fix `(this.licensee as any)` pattern |

### Do NOT Modify

- `src/types/index.ts` existing entries (`ILicensee`, `IContact`, `IMessage`, `IBody`, `IRoom`, `ITrigger`) — owned by task-01 or already present
- `src/app/models/Licensee.ts`, `src/app/models/Contact.ts`, `src/app/models/Message.ts`, `src/app/models/Body.ts` — owned by phase-1/task-01
- `src/app/models/User.ts`, `src/app/models/Template.ts` — owned by phase-1/task-03

## Implementation Steps

### Step 1: Apply `IRoom` and `ITrigger` to schemas

Read the existing interface definitions in `src/types/index.ts`. In `Room.ts` and `Trigger.ts`, apply the generics:
```ts
const RoomSchema = new mongoose.Schema<IRoom>({ ... })
export default mongoose.model<IRoom>('Room', RoomSchema)
```

### Step 2: Define `IDepartment`

Read `src/app/models/Department.ts`. Note the `licensee` reference field (use `mongoose.Types.ObjectId | ILicensee` union). Note the validator that uses `any[]` — type it as `string[]` or the actual value shape. Add `IDepartment` to `src/types/index.ts`.

### Step 3: Define `IInbox`

Read `src/app/models/Inbox.ts`. Note the `kind: 'messenger' | 'chat'` field and WhatsApp/chat default fields. Add `IInbox` to `src/types/index.ts`.

### Step 4: Apply generics to Department and Inbox

Apply `Schema<IDepartment>` and `Schema<IInbox>` patterns. Fix the `(this.licensee as any)` casts inside pre-save hooks — type `this` as the document type instead.

### Step 5: Typecheck

Run `npx tsc --noEmit` and fix errors only in owned files.

## Testing

- [ ] `npx tsc --noEmit` passes with no new errors
- [ ] `NODE_ENV=test npx jest --testPathPattern="models/(Room|Trigger|Department|Inbox)" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required (pattern established by task-01)

## Completion Criteria

- [ ] `IDepartment` and `IInbox` defined and exported from `src/types/index.ts`
- [ ] Room, Trigger, Department, Inbox schemas use `Schema<I{Model}>` generic
- [ ] No `any` casts in the 4 modified model files
- [ ] All model tests pass
- [ ] `npx tsc --noEmit` clean
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-backend/phase-1/task-02-setores-session-model-interfaces`

## Conflict Avoidance Notes

- Only append new interfaces (`IDepartment`, `IInbox`) to `src/types/index.ts` — do not modify entries from task-01 or task-03.
