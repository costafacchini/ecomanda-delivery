# Task: Create src/types/index.ts with domain enums and interfaces

**Plan**: JS to TypeScript Migration
**Phase**: 2
**Task Path**: phase-2/task-05-domain-types
**Depends On**: phase-1/task-02-tsconfig-root
**JIRA**: N/A

## Objective

Create `src/types/index.ts` containing shared domain enums and interfaces used across the backend, establishing the type foundation for all subsequent migration tasks.

## Context

Enums needed: `LicenseKind`, `ChatbotDefault`, `WhatsappDefault`, `ChatDefault`, `CartDefault`, `MessageKind`, `MessageDestination`, `MessageStatus`. Interfaces needed: `ILicensee`, `IContact`, `IMessage`, `IRoom`, `ITrigger`. These map to existing model fields — read the model files to extract field names and types before writing.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/types/index.ts` | create | Domain enums and interfaces |

## Implementation Steps

### Step 1: Read core model files
Read `src/app/models/Licensee.js`, `Contact.js`, `Message.js`, `Room.js`, `Trigger.js` to extract field names.

### Step 2: Write enums
Extract string literal values currently scattered across models and helpers into TypeScript `enum` declarations.

### Step 3: Write interfaces
Create `interface I<ModelName>` for each core model with typed fields matching the Mongoose schema definitions.

### Step 4: Verify typecheck
`yarn typecheck` must still pass.

## Testing

- [ ] `yarn typecheck` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `src/types/index.ts` exists with all listed enums and interfaces
- [ ] `yarn typecheck` still passes
- [ ] Changes committed to `plan/js-to-ts/phase-2/task-05-domain-types` branch
- [ ] Status updated in `status.md`
