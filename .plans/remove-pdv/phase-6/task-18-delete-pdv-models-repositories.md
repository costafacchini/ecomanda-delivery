# Task: Delete PDV models and repositories

**Plan**: Remove PDV Domain
**Phase**: 6
**Task Path**: phase-6/task-18-delete-pdv-models-repositories
**Depends On**: phase-5/task-14-delete-cart-plugins, phase-5/task-15-delete-payment-plugins, phase-5/task-16-delete-integration-plugins, phase-5/task-17-delete-facebook-catalog-importer
**JIRA**: N/A

## Objective

Delete the 5 PDV Mongoose model files and their corresponding repositories, plus their spec files.

## Context

> WARNING: Confirm that MongoDB collections (carts, orders, products, integrationlogs, backgroundjobs) contain no active production data before proceeding. Provide an archive script if data exists.

Models to delete: `Cart.ts`, `Order.ts`, `Product.ts`, `Integrationlog.ts`, `Backgroundjob.ts`.
Repositories to delete: `cart.js`, `order.js`, `product.js`, and `integrationlog.js`/`backgroundjob.js` if they were created by the decouple-mongo plan.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/models/Cart.ts` | delete | + spec |
| `src/app/models/Order.ts` | delete | + spec |
| `src/app/models/Product.ts` | delete | + spec |
| `src/app/models/Integrationlog.ts` | delete | + spec |
| `src/app/models/Backgroundjob.ts` | delete | + spec |
| `src/app/repositories/cart.ts` | delete | + spec if exists |
| `src/app/repositories/order.ts` | delete | + spec if exists |
| `src/app/repositories/product.ts` | delete | + spec if exists |
| `src/app/repositories/integrationlog.ts` | delete | if exists |
| `src/app/repositories/backgroundjob.ts` | delete | if exists |

## Implementation Steps

### Step 1: Grep for remaining imports of each model and repository
Each must return zero remaining consumers before deletion.

### Step 2: Delete all model and repository files + specs

### Step 3: Run tests

## Testing

- [ ] `npx jest` passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All 5 PDV models deleted
- [ ] All corresponding repositories deleted
- [ ] No remaining imports
- [ ] Changes committed to `plan/remove-pdv/phase-6/task-18-delete-pdv-models-repositories` branch
- [ ] Status updated in `status.md`
