# Task: Query Class Types

**Plan**: Backend Type Narrowing
**Phase**: 3
**Task ID (phase-local)**: task-08
**Task Path**: phase-3/task-08-queries
**Depends On**: phase-2/task-04-core-repositories, phase-2/task-05-remaining-repositories
**JIRA**: N/A

## Objective

Type all query classes in `src/app/queries/` — QueryBuilder, MessagesQuery, BillingQuery, LicenseeMessagesByDayQuery, and any others — replacing `any` in filter, sort, and result methods.

## Context

The query layer sits between repositories and controllers, building Mongoose query chains. `QueryBuilder` is the base class. Key `any` hotspots: filter method params (150 occurrences across queries directory), the `all()` return type, and builder method chaining.

Files in scope:
- `src/app/queries/QueryBuilder.ts`
- `src/app/queries/MessagesQuery.ts`
- `src/app/queries/BillingQuery.ts`
- `src/app/queries/LicenseeMessagesByDayQuery.ts`
- any other `*Query.ts` files in the directory

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-2/task-04-core-repositories` and `phase-2/task-05-remaining-repositories` are `complete`
- [ ] `ls src/app/queries/` to confirm the full list of query files
- [ ] Check this task's `status.md` and mark `in-progress` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/queries/QueryBuilder.ts` | modify | Make generic; define `IQueryBuilder<T>` |
| `src/app/queries/MessagesQuery.ts` | modify | Type filters and `all()` return |
| `src/app/queries/BillingQuery.ts` | modify | Type date params and result shape |
| `src/app/queries/LicenseeMessagesByDayQuery.ts` | modify | Type result shape |
| `src/app/queries/*.ts` (remaining) | modify | Same pattern |

### Do NOT Modify

- `src/app/controllers/*` — owned by phase-3/task-09
- `src/app/repositories/*` — Phase 2 ownership (complete)

## Implementation Steps

### Step 1: Make QueryBuilder generic

Introduce a type parameter `T` for the model being queried. Type the Mongoose query chain internals. Export `IQueryBuilder<T>` interface.

### Step 2: Type individual query classes

For each query class, extend `QueryBuilder<IMessage>` (or appropriate interface). Type filter method params (e.g., `filterByContact(contactId: mongoose.Types.ObjectId | string)`). Type the `all()` return as `Promise<IMessage[]>`.

### Step 3: Typecheck and fix

Run `npx tsc --noEmit`. Fix only files in the ownership table.

## Testing

- [ ] `npx tsc --noEmit` passes
- [ ] `NODE_ENV=test npx jest --testPathPattern="queries/" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required

## Completion Criteria

- [ ] `QueryBuilder` is generic
- [ ] All query classes have typed filter methods and typed `all()` return
- [ ] All query tests pass
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-backend/phase-3/task-08-queries`
