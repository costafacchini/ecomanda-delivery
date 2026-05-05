# Task: Extract ReceivePedidos10Order and ChangePedidos10OrderStatus use cases

**Plan**: Use Cases
**Phase**: 7
**Task Path**: phase-7/task-13-order-usecases
**Depends On**: phase-1/task-01-scaffold-usecases-dir
**JIRA**: N/A

## Objective

Extract `ReceivePedidos10Order` and `ChangePedidos10OrderStatus` use cases from `OrdersController`, each with a spec that runs without `mongoServer`.

## Context

`OrdersController.create` logs to integrationlog, saves the request body, and enqueues a `pedidos10-webhook` job. `OrdersController.changeStatus` logs, saves, and enqueues `pedidos10-change-order-status`. Both use cases receive `{ integrationlogRepository, orderRepository, jobQueue }`. Tests mock the queue and use in-memory repositories.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/orders/ReceivePedidos10Order.js` | create | |
| `src/app/usecases/orders/ReceivePedidos10Order.spec.js` | create | |
| `src/app/usecases/orders/ChangePedidos10OrderStatus.js` | create | |
| `src/app/usecases/orders/ChangePedidos10OrderStatus.spec.js` | create | |

## Implementation Steps

### Step 1: Read OrdersController
Read `src/app/controllers/OrdersController.js` to capture exact log/save/enqueue sequence.

### Step 2: Create both use cases
Each receives repository and queue dependencies via constructor. `execute(body)` performs the log → save → enqueue sequence.

### Step 3: Write specs
Mock job queue. Use in-memory repositories. Assert log record created and queue called with correct job name.

## Testing

- [ ] `npx jest src/app/usecases/orders/` passes without mongoServer
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No product or API documentation changes expected for this extraction alone
- [ ] If the Pedidos10 webhook/order-status orchestration pattern becomes reusable for later use-case extractions, capture it with `document-solution`
- [ ] If any KB files change, run `check-kb-index`

## Completion Criteria

- [ ] Both use case files and specs created and passing
- [ ] Changes committed to `plan/use-cases/phase-7/task-13-order-usecases` branch
- [ ] Status updated in `status.md`
