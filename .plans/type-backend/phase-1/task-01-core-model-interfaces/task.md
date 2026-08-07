# Task: Core Model Interfaces

**Plan**: Backend Type Narrowing
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-core-model-interfaces
**Depends On**: None
**JIRA**: N/A

## Objective

Complete the core model interfaces in `src/types/index.ts` — specifically adding `IBody` (not yet defined) and applying all existing interfaces (`ILicensee`, `IContact`, `IMessage`) as generic parameters to their Mongoose schemas and model declarations.

## Context

`src/types/index.ts` already exists with partial content: `ILicensee`, `IContact`, `IMessage`, `IRoom`, `ITrigger` interfaces and 7 enums are already defined. This task does NOT create the file from scratch — it extends what's there.

Outstanding work:
- `IBody` is missing — define and export it
- Mongoose schema/model declarations in Licensee, Contact, Message, Body do not yet use the `Schema<I{Model}>` generic — apply it
- `src/app/models/Message.ts` has a stale `cart` field reference (line ~89) left over from remove-pdv — remove it while in scope

All interfaces live in `src/types/index.ts` (single-file barrel convention). Do not split into per-model files.

**Critical constraint: interfaces must be database-agnostic.** `src/types/index.ts` currently imports `Types` from `mongoose` and uses `Types.ObjectId` — this couples domain interfaces to Mongoose. This task must fix that:

- Remove the `import { Types } from 'mongoose'` from `src/types/index.ts`
- Change all `_id: Types.ObjectId` to `_id: string`
- Change all FK reference fields from `Types.ObjectId | IRelated` to `string | IRelated`
- Mongoose model files (`src/app/models/`) may still use `mongoose.Types.ObjectId` internally — that is correct. Only `src/types/index.ts` must be clean of Mongoose imports.

Read `docs/kb/architecture/typescript-conventions.md` before starting.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Read `src/types/index.ts` to understand what is already defined
- [ ] Read `docs/kb/architecture/typescript-conventions.md`
- [ ] Read `docs/kb/architecture/project-overview.md` for domain model descriptions
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/types/index.ts` | modify | Add `IBody`; do not modify existing interfaces |
| `src/app/models/Licensee.ts` | modify | Apply `Schema<ILicensee>` and `model<ILicensee>` generics |
| `src/app/models/Contact.ts` | modify | Apply `Schema<IContact>` and `model<IContact>` generics |
| `src/app/models/Message.ts` | modify | Apply `Schema<IMessage>`, `model<IMessage>`, remove stale `cart` field |
| `src/app/models/Body.ts` | modify | Apply `Schema<IBody>` and `model<IBody>` generics |

### Do NOT Modify

- Existing interfaces in `src/types/index.ts` (`ILicensee`, `IContact`, `IMessage`, `IRoom`, `ITrigger`, enums) — owned already
- `src/app/models/Room.ts`, `src/app/models/Trigger.ts` — owned by phase-1/task-02
- `src/app/models/User.ts` — owned by phase-1/task-03
- `src/app/repositories/*` — Phase 2 ownership
- `src/app/usecases/*` — Phase 2 ownership

## Implementation Steps

### Step 1: Read current `src/types/index.ts`

Understand the existing interface shapes and enum names before making changes. Note the `MessengerDefault` enum — it should use `'utalk'` not `'wevo'`.

### Step 2: Define `IBody`

Read `src/app/models/Body.ts`. Note any references to other models. Add `IBody` to `src/types/index.ts` following the same pattern as existing interfaces.

### Step 3: Apply interfaces to Mongoose schemas

In each model file, update the schema and model declarations:
```ts
const LicenseeSchema = new mongoose.Schema<ILicensee>({ ... })
export default mongoose.model<ILicensee>('Licensee', LicenseeSchema)
```
Keep all existing validators and hooks — only change type annotations.

### Step 4: Clean stale `cart` field from Message

In `src/app/models/Message.ts`, locate the `cart: { type: ObjectId, ref: 'Cart' }` field left over from remove-pdv and remove it. Verify no spec references it.

### Step 5: Typecheck

Run `npx tsc --noEmit` and fix any errors introduced. Do not fix errors in files outside your ownership table.

## Testing

- [ ] `npx tsc --noEmit` passes with no new errors
- [ ] `NODE_ENV=test npx jest --testPathPattern="models/(Licensee|Contact|Message|Body)" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Update `docs/kb/architecture/typescript-conventions.md` to document the `src/types/` single-barrel pattern and interface naming convention (`I{Model}`)
- [ ] Run `check-kb-index` after updating the KB file

## Completion Criteria

- [ ] `IBody` interface defined and exported from `src/types/index.ts`
- [ ] `src/types/index.ts` has NO import from `mongoose` — all `_id` and FK fields use `string`
- [ ] Licensee, Contact, Message, Body schemas use `Schema<I{Model}>` generic
- [ ] Stale `cart` field removed from `Message.ts`
- [ ] No `any` in return type positions of the 4 modified model files
- [ ] All model tests pass
- [ ] `npx tsc --noEmit` clean
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-backend/phase-1`

## Conflict Avoidance Notes

- Task-02 and task-03 will add entries to `src/types/index.ts`. Only add exports for `IBody` — do not touch other interface definitions.
