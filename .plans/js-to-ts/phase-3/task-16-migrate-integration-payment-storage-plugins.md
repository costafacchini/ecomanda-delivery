# Task: Migrate plugins/integrations, payments, and storage to .ts

**Plan**: JS to TypeScript Migration
**Phase**: 3
**Task Path**: phase-3/task-16-migrate-integration-payment-storage-plugins
**Depends On**: phase-3/task-11-migrate-services
**JIRA**: N/A

## Objective

Rename all integration (8 files), payment/PagarMe (6 files), and storage (1 file) plugin files from `.js` to `.ts`.

## Context

These three plugin groups are grouped in one task because they are collectively smaller and share a similar pattern. `plugins/integrations/` includes `IntegratorBase.js`, `Pedidos10.js`, `factory.js`, and `Pedidos10/Order.js`, `Pedidos10/Parser.js`. `plugins/payments/` includes `PagarMe.js` and `PagarMe/Card.js`, `Customer.js`, `Payment.js`, `Parser.js`, `Recipient.js`. `plugins/storage/` is a single file.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/integrations/**/*.js` | rename to `.ts` | 8 files |
| `src/app/plugins/payments/**/*.js` | rename to `.ts` | 6 files |
| `src/app/plugins/storage/*.js` | rename to `.ts` | 1 file |
| Corresponding `.spec.js` files | rename to `.spec.ts` | |

## Implementation Steps

### Step 1: Rename leaf files first (Pedidos10/ subdirectory, PagarMe/ subdirectory)
### Step 2: Rename top-level files (IntegratorBase, PagarMe, factory, storage)
### Step 3: Run typecheck and tests after each batch

## Testing

- [ ] `yarn typecheck` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All 15 plugin files renamed to `.ts`
- [ ] Changes committed to `plan/js-to-ts/phase-3/task-16-migrate-integration-payment-storage-plugins` branch
- [ ] Status updated in `status.md`
