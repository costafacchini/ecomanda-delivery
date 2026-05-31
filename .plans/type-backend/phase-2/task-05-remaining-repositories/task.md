# Task: Remaining Repository Types

**Plan**: Backend Type Narrowing
**Phase**: 2
**Task ID (phase-local)**: task-05
**Task Path**: phase-2/task-05-remaining-repositories
**Depends On**: phase-1/task-02-transactional-model-interfaces, phase-1/task-03-system-model-interfaces
**JIRA**: N/A

## Objective

Type the remaining repositories (room, trigger, template, cart, order, product, user, backgroundjob, integrationlog, whatsappsession, messenger) using the interfaces from Phase 1 tasks 02 and 03.

## Context

Depends on task-04 for the generic base `IRepository<T>` and `Repository<T>` class. Once task-04 is merged, these repos just need the appropriate type parameter applied.

**Note on PDV repos**: Check `remove-pdv` plan status. If it is `in-progress` or `complete`, skip cart, order, product repositories.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-1/task-02-transactional-model-interfaces` and `phase-1/task-03-system-model-interfaces` are `complete`
- [ ] Verify `phase-2/task-04-core-repositories` is `complete` — the generic base must exist
- [ ] **Check `remove-pdv` status** — if in-progress/complete, skip cart/order/product repos
- [ ] Check this task's `status.md` and mark `in-progress` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/repositories/room.ts` | modify | Type with `IRoom` |
| `src/app/repositories/trigger.ts` | modify | Type with `ITrigger` |
| `src/app/repositories/template.ts` | modify | Type with `ITemplate` |
| `src/app/repositories/user.ts` | modify | Type with `IUser` |
| `src/app/repositories/backgroundjob.ts` | modify | Type with `IBackgroundjob` |
| `src/app/repositories/integrationlog.ts` | modify | Type with `IIntegrationlog` |
| `src/app/repositories/whatsappsession.ts` | modify | Type with `IWhatsappSession` |
| `src/app/repositories/messenger.ts` | modify | Type with appropriate interface |
| `src/app/repositories/cart.ts` | modify | Type with `ICart` (skip if remove-pdv active) |
| `src/app/repositories/order.ts` | modify | Type with `IOrder` (skip if remove-pdv active) |
| `src/app/repositories/product.ts` | modify | Type with `IProduct` (skip if remove-pdv active) |

### Do NOT Modify

- `src/app/repositories/repository.ts`, `src/app/repositories/licensee.ts`, `src/app/repositories/contact.ts`, `src/app/repositories/message.ts`, `src/app/repositories/body.ts` — owned by phase-2/task-04

## Implementation Steps

Apply the generic `Repository<T>` base class pattern from task-04 to each remaining repository. The pattern is consistent — read task-04's implementation for reference before starting.

## Testing

- [ ] `npx tsc --noEmit` passes
- [ ] `NODE_ENV=test npx jest --testPathPattern="repositories/(room|trigger|template|user)" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required

## Completion Criteria

- [ ] All in-scope repositories typed (noting skipped PDV repos)
- [ ] All relevant repository tests pass
- [ ] `npx tsc --noEmit` clean
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-backend/phase-2/task-05-remaining-repositories`
