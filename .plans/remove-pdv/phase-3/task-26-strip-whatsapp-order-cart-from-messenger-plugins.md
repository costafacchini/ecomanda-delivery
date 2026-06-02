# Task: Strip WhatsApp order/cart handling from messenger plugins

**Plan**: Remove PDV Domain
**Phase**: 3
**Task Path**: phase-3/task-26-strip-whatsapp-order-cart-from-messenger-plugins
**Depends On**: phase-2/task-04-delete-carts-controller, phase-2/task-05-delete-orders-controller, phase-2/task-06-delete-integrations-controller
**JIRA**: N/A

## Objective

Remove all WhatsApp native order/cart handling from the messenger plugin layer: strip `cartRepository` from `Base.ts`, strip `createCartPlugin` and `order` message parsing from `Dialog.ts`, remove the `order` case from `YCloud.ts`, and remove the `order` type filter from `Pabbly.ts`. Update all affected specs.

## Context

WhatsApp supports a native shopping catalog flow where customers send `order` type messages. The messenger plugins convert these into `Cart` records via `cartRepository` and route them through `plugins/carts/` adapters. Since the Cart model, cart repository, and cart plugins are all being deleted in Phases 5–6, this messenger-side logic must be stripped first.

`Baileys.ts` has no cart/order references — no changes needed there.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/messengers/Base.ts` | modify | Remove `_cartRepository` field, getter, and the `order`→`cart` conversion block |
| `src/app/plugins/messengers/Dialog.ts` | modify | Remove `_createCartPlugin` field and getter, `order` message parsing, cart send path |
| `src/app/plugins/messengers/Dialog.spec.ts` | modify | Remove `describe('cart', ...)` receive block, cart send tests, cart factory and CartRepositoryDatabase imports |
| `src/app/plugins/messengers/YCloud.ts` | modify | Remove `case 'order':` block from message parsing switch |
| `src/app/plugins/messengers/YCloud.spec.ts` | modify | Remove `'should parse order message correctly'` test |
| `src/app/plugins/messengers/Pabbly.ts` | modify | Remove `'order'` from message type filter |
| `src/app/plugins/messengers/Pabbly.spec.ts` | modify | Remove `'order'` from the type filter test assertion |

## Implementation Steps

### Step 1: Strip Base.ts

Read `Base.ts`. Remove:
- `_cartRepository: any` field declaration
- `cartRepository` constructor parameter and `this._cartRepository = cartRepository` assignment
- `get cartRepository()` getter
- The entire `else if (messageToSend.kind === 'order')` block that converts orders to carts and saves via `cartRepository`

### Step 2: Strip Dialog.ts

Read `Dialog.ts`. Remove:
- `_createCartPlugin` field, constructor parameter, and getter
- The `else if (responseBody.messages[0].type === 'order')` block that sets `this.messageData.order`
- The `if (messageToSend.kind === 'cart')` send block that calls `createCartPlugin`

### Step 3: Update Dialog.spec.ts

Remove:
- `import { cart as cartFactory } from '@factories/cart'`
- `import { CartRepositoryDatabase } from '@repositories/cart'`
- The `describe('cart', ...)` block for receive tests (2 `it` cases covering create and update cart)
- The `describe('when the message is cart', ...)` send block

### Step 4: Strip YCloud.ts

Read `YCloud.ts`. Remove the `case 'order':` block that sets `this.messageData.order`.

### Step 5: Update YCloud.spec.ts

Remove the `'should parse order message correctly'` test.

### Step 6: Strip Pabbly.ts

Read `Pabbly.ts`. Remove `'order'` from the message type filter condition (line ~180).

### Step 7: Update Pabbly.spec.ts

Remove `'order'` from the type filter test assertion.

### Step 8: Run tests

`npx jest src/app/plugins/messengers/` — all messenger specs must pass.

## Testing

- [ ] `npx jest src/app/plugins/messengers/Dialog.spec.ts` passes
- [ ] `npx jest src/app/plugins/messengers/YCloud.spec.ts` passes
- [ ] `npx jest src/app/plugins/messengers/Pabbly.spec.ts` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `Base.ts` has no `cartRepository` reference
- [ ] `Dialog.ts` has no `createCartPlugin` reference and no `order` message handling
- [ ] `YCloud.ts` has no `order` case in message parsing
- [ ] `Pabbly.ts` has no `order` type filter
- [ ] All affected specs updated and passing
- [ ] Changes committed to `plan/remove-pdv/phase-3/task-26-strip-whatsapp-order-cart-from-messenger-plugins` branch
- [ ] Status updated in `status.md`
