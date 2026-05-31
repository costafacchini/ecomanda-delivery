# Task: Core Model Interfaces

**Plan**: Backend Type Narrowing
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-core-model-interfaces
**Depends On**: None
**JIRA**: N/A

## Objective

Define TypeScript interfaces for the four core domain models — Licensee, Contact, Message, and Body — and create the `src/types/` directory that all subsequent tasks will import from.

## Context

The JS→TS migration introduced `any` everywhere. The foundation of narrowing the backend is giving each Mongoose document a matching TypeScript interface. These four models are referenced by almost every other layer (repositories, use cases, controllers, plugins), so they must be typed first.

Mongoose document types follow the pattern: define a plain interface `ILicensee` with all fields typed, then use `mongoose.Document & ILicensee` as the document type. Export the interface from `src/types/index.ts` so downstream tasks can import from a single location.

Reference models for existing field shapes:
- `src/app/models/Licensee.ts` — ~120 lines, many enum-constrained string fields
- `src/app/models/Contact.ts`
- `src/app/models/Message.ts`
- `src/app/models/Body.ts`

Read `docs/kb/architecture/typescript-conventions.md` before starting.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `js-to-ts` plan is complete (check `status.md`)
- [ ] Read `docs/kb/architecture/typescript-conventions.md`
- [ ] Read `docs/kb/architecture/project-overview.md` for domain model descriptions
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/types/index.ts` | create | Central export barrel — create and own this file |
| `src/types/licensee.ts` | create | `ILicensee` interface |
| `src/types/contact.ts` | create | `IContact` interface |
| `src/types/message.ts` | create | `IMessage` interface |
| `src/types/body.ts` | create | `IBody` interface |
| `src/app/models/Licensee.ts` | modify | Import and apply `ILicensee` to schema type |
| `src/app/models/Contact.ts` | modify | Import and apply `IContact` to schema type |
| `src/app/models/Message.ts` | modify | Import and apply `IMessage` to schema type |
| `src/app/models/Body.ts` | modify | Import and apply `IBody` to schema type |

### Do NOT Modify

- `src/app/models/Cart.ts` — owned by phase-1/task-02-transactional-model-interfaces
- `src/app/models/Order.ts` — owned by phase-1/task-02-transactional-model-interfaces
- `src/app/models/User.ts` — owned by phase-1/task-03-system-model-interfaces
- `src/app/repositories/*` — Phase 2 ownership
- `src/app/usecases/*` — Phase 2 ownership

## Implementation Steps

### Step 1: Create `src/types/` directory and barrel

Create `src/types/index.ts` as an empty barrel — sibling tasks will add their exports to it. Own the initial file creation; task-02 and task-03 will add to it.

### Step 2: Define `ILicensee`

Read `src/app/models/Licensee.ts` carefully. Extract all SchemaDefinition fields into an interface. Use literal union types for enum-constrained fields (e.g., `whatsappDefault: 'dialog' | 'baileys' | 'wevo' | 'ycloud' | 'pabbly' | null`). Mark optional fields with `?`. Export from `src/types/licensee.ts` and re-export from `src/types/index.ts`.

### Step 3: Define `IContact`

Same process for `src/app/models/Contact.ts`. Note the `licensee` field references `ILicensee` — type it as `mongoose.Types.ObjectId | ILicensee` to support both populated and unpopulated states.

### Step 4: Define `IMessage`

Read `src/app/models/Message.ts`. The `contact` and `licensee` fields may be populated or ObjectId — use the union pattern. Note the `kind` enum field.

### Step 5: Define `IBody`

Read `src/app/models/Body.ts`. Note any references to other models.

### Step 6: Apply interfaces to Mongoose schemas

In each model file, update the schema/model declaration to use the interface:
```ts
const LicenseeSchema = new mongoose.Schema<ILicensee>({ ... })
export default mongoose.model<ILicensee>('Licensee', LicenseeSchema)
```

Keep all existing validators and hooks — only change the type annotations.

### Step 7: Typecheck

Run `npx tsc --noEmit` and fix any errors introduced. Do not fix errors in files outside your ownership table.

## Testing

- [ ] `npx tsc --noEmit` passes with no new errors
- [ ] `NODE_ENV=test npx jest --testPathPattern="models/(Licensee|Contact|Message|Body)" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Update `docs/kb/architecture/typescript-conventions.md` to document the `src/types/` pattern and interface naming convention (`I{Model}`)
- [ ] Run `check-kb-index` after updating the KB file

## Completion Criteria

- [ ] `src/types/` directory created with `index.ts` barrel
- [ ] `ILicensee`, `IContact`, `IMessage`, `IBody` interfaces defined and exported
- [ ] Mongoose models typed with their interfaces
- [ ] No `any` in return type positions of the 4 modified model files
- [ ] All model tests pass
- [ ] `npx tsc --noEmit` clean
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-backend/phase-1/task-01-core-model-interfaces`

## Conflict Avoidance Notes

- Task-02 and task-03 will add entries to `src/types/index.ts`. Coordinate by only adding exports for your own interfaces — do not touch other interface files.
- If task-02 or task-03 need to reference `ILicensee` or `IContact` before this task merges, they should import a stub from this task's branch or use `any` temporarily.
