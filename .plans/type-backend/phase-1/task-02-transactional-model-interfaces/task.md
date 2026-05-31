# Task: Transactional Model Interfaces

**Plan**: Backend Type Narrowing
**Phase**: 1
**Task ID (phase-local)**: task-02
**Task Path**: phase-1/task-02-transactional-model-interfaces
**Depends On**: None
**JIRA**: N/A

## Objective

Define TypeScript interfaces for the transactional domain models — Cart, Order, Product, Room, and Trigger — and add them to `src/types/index.ts`.

## Context

These models represent the PDV (point-of-sale) and chat session domains. **Important**: the `remove-pdv` plan will eventually delete Cart, Order, Product, and PagarMe-related code. Before starting this task, check whether `remove-pdv` has begun execution — if so, skip Cart/Order/Product and note the adaptation in `status.md`.

Room is the chat session model and is NOT part of remove-pdv. Trigger drives chatbot flow logic and is also permanent.

Reference models:
- `src/app/models/Cart.ts`
- `src/app/models/Order.ts`
- `src/app/models/Product.ts`
- `src/app/models/Room.ts`
- `src/app/models/Trigger.ts`

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] **Check `remove-pdv` plan status** — if it is `in-progress` or `complete`, skip Cart, Order, Product interfaces and note the adaptation
- [ ] Read `docs/kb/architecture/typescript-conventions.md`
- [ ] Verify task-01 (`phase-1/task-01-core-model-interfaces`) status — if complete, import from `src/types/index.ts` as needed; if not, stub cross-references with `any`
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/types/cart.ts` | create | `ICart` interface (skip if remove-pdv in progress) |
| `src/types/order.ts` | create | `IOrder` interface (skip if remove-pdv in progress) |
| `src/types/product.ts` | create | `IProduct` interface (skip if remove-pdv in progress) |
| `src/types/room.ts` | create | `IRoom` interface |
| `src/types/trigger.ts` | create | `ITrigger` interface |
| `src/types/index.ts` | modify | Add exports for new interfaces |
| `src/app/models/Cart.ts` | modify | Apply `ICart` (skip if remove-pdv in progress) |
| `src/app/models/Order.ts` | modify | Apply `IOrder` (skip if remove-pdv in progress) |
| `src/app/models/Product.ts` | modify | Apply `IProduct` (skip if remove-pdv in progress) |
| `src/app/models/Room.ts` | modify | Apply `IRoom` |
| `src/app/models/Trigger.ts` | modify | Apply `ITrigger` |

### Do NOT Modify

- `src/types/licensee.ts`, `src/types/contact.ts`, `src/types/message.ts`, `src/types/body.ts` — owned by phase-1/task-01
- `src/app/models/Licensee.ts`, `src/app/models/Contact.ts`, `src/app/models/Message.ts`, `src/app/models/Body.ts` — owned by phase-1/task-01
- `src/app/models/User.ts`, `src/app/models/Template.ts` — owned by phase-1/task-03

## Implementation Steps

### Step 1: Check remove-pdv status

If `remove-pdv` is `in-progress` or `complete`, skip Cart/Order/Product and document in `status.md`.

### Step 2: Define interfaces

For each model in scope, read the schema definition and produce a matching interface in `src/types/{model}.ts`. Use union types for enum fields. Use `mongoose.Types.ObjectId | IRelated` for reference fields.

### Step 3: Apply to Mongoose schemas

Update each model file to pass the interface as the generic parameter to `Schema` and `model`.

### Step 4: Export from barrel

Add each new interface to `src/types/index.ts`.

### Step 5: Typecheck

Run `npx tsc --noEmit` and fix errors only within owned files.

## Testing

- [ ] `npx tsc --noEmit` passes with no new errors
- [ ] `NODE_ENV=test npx jest --testPathPattern="models/(Cart|Order|Product|Room|Trigger)" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required for this task (pattern established by task-01)

## Completion Criteria

- [ ] Interfaces defined for all in-scope models (noting any skipped due to remove-pdv)
- [ ] Mongoose models typed with their interfaces
- [ ] `src/types/index.ts` updated with new exports
- [ ] All relevant model tests pass
- [ ] `npx tsc --noEmit` clean
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-backend/phase-1/task-02-transactional-model-interfaces`

## Conflict Avoidance Notes

- Only append to `src/types/index.ts` — do not modify exports added by task-01 or task-03.
