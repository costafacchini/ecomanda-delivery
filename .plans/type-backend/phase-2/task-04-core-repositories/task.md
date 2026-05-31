# Task: Core Repository Types

**Plan**: Backend Type Narrowing
**Phase**: 2
**Task ID (phase-local)**: task-04
**Task Path**: phase-2/task-04-core-repositories
**Depends On**: phase-1/task-01-core-model-interfaces
**JIRA**: N/A

## Objective

Type the base `Repository` class and the core entity repositories (licensee, contact, message, body) using the interfaces from Phase 1. Replace `any` in method signatures with concrete types.

## Context

`src/app/repositories/repository.ts` defines the base `Repository` and `RepositoryMemory` classes used by all concrete repos. It has generic CRUD methods (`findFirst`, `findAll`, `create`, `update`, `delete`) that currently return `any`. Making these generic will propagate types automatically to all subclasses.

Core repos to type: `licensee.ts`, `contact.ts`, `message.ts`, `body.ts`.

Read `docs/kb/architecture/dependency-injection-runtime-wiring.md` — it explains how repos are injected into use cases and controllers.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-1/task-01-core-model-interfaces` status is `complete` — confirm `src/types/licensee.ts`, `src/types/contact.ts`, `src/types/message.ts`, `src/types/body.ts` exist
- [ ] Read `docs/kb/architecture/dependency-injection-runtime-wiring.md`
- [ ] Read `src/app/repositories/repository.ts` fully before making changes
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/repositories/repository.ts` | modify | Make base class generic; define `IRepository<T>` interface |
| `src/app/repositories/licensee.ts` | modify | Type methods with `ILicensee` |
| `src/app/repositories/contact.ts` | modify | Type methods with `IContact` |
| `src/app/repositories/message.ts` | modify | Type methods with `IMessage` |
| `src/app/repositories/body.ts` | modify | Type methods with `IBody` |

### Do NOT Modify

- `src/app/repositories/cart.ts`, `src/app/repositories/order.ts`, `src/app/repositories/product.ts` — owned by phase-2/task-05
- `src/app/repositories/room.ts`, `src/app/repositories/trigger.ts`, `src/app/repositories/user.ts` — owned by phase-2/task-05
- `src/app/usecases/*` — Phase 2 task-06/task-07 ownership
- `src/app/controllers/*` — Phase 3 ownership

## Implementation Steps

### Step 1: Make the base Repository generic

In `repository.ts`, introduce a generic type parameter `T` on the class. Update `findFirst`, `findAll`, `create`, `update` to return `Promise<T | null>`, `Promise<T[]>`, `Promise<T>` etc. as appropriate. Preserve the existing `RepositoryMemory` class structure.

Define and export an `IRepository<T>` interface that describes the public API — this is what use cases and controllers depend on.

### Step 2: Type core repositories

For each repo, extend the generic base with the appropriate type parameter:
```ts
class LicenseeRepositoryDatabase extends Repository<ILicensee> { ... }
```

Add typed method overrides only where the base return type isn't precise enough.

### Step 3: Type memory repositories

Update any in-memory repo implementations (used in tests) with the same generic parameter.

### Step 4: Typecheck

Run `npx tsc --noEmit`. Expect some errors in use cases and controllers — those are Phase 3. Suppress with `as any` temporarily only if they block compilation, and document in status.md.

## Testing

- [ ] `npx tsc --noEmit` passes (or remaining errors are only in Phase 3 files — document which)
- [ ] `NODE_ENV=test npx jest --testPathPattern="repositories/(licensee|contact|message|body)" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required

## Completion Criteria

- [ ] `IRepository<T>` interface exported from `src/app/repositories/repository.ts`
- [ ] Base Repository class is generic
- [ ] licensee, contact, message, body repos typed
- [ ] All relevant repository tests pass
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-backend/phase-2/task-04-core-repositories`
