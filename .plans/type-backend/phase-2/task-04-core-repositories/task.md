# Task: Core Repository Types

**Plan**: Backend Type Narrowing
**Phase**: 2
**Task ID (phase-local)**: task-04
**Task Path**: phase-2/task-04-core-repositories
**Depends On**: phase-1/task-01-core-model-interfaces
**JIRA**: N/A

## Objective

Make the repository layer the anti-corruption boundary between Mongoose and the rest of the app. Type the base `Repository` class to return plain domain objects (not Mongoose Documents), define `IRepository<T>`, and apply it to the four core repos (licensee, contact, message, body).

## Context

`src/app/repositories/repository.ts` defines the base `Repository` and `RepositoryMemory` classes. Currently all methods return `any` and the Database implementation returns Mongoose Documents directly. This task fixes both problems:

1. **Return types** — methods must return plain `T` objects, not `mongoose.Document<T>`
2. **Mongoose leak** — `Repository.save(document)` exposes Mongoose Document lifecycle to callers; it must be removed from the public `IRepository<T>` contract
3. **`.lean()` for reads** — `findFirst` and `find` on the Database class must use `.lean()` to get POJOs
4. **`.toObject()` for creates** — `create` on the Database class must call `.toObject()` before returning
5. **`_id` must be `string` at runtime** — `.lean()` and `.toObject()` return `_id` as `mongodb.ObjectId`, not `string`. The repository must explicitly convert: `_id: doc._id.toString()`. Without this, any `===` comparison between an ID from the DB and a string will silently return `false`.

`RepositoryMemory` already implements the POJO pattern via `serializeInput()` and `toObject()` — the Database class needs to match.

Read `docs/kb/architecture/dependency-injection-runtime-wiring.md` for context on how repos are injected.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-1/task-01-core-model-interfaces` is `complete` — confirm `src/types/index.ts` has `ILicensee`, `IContact`, `IMessage`, `IBody` with `string` IDs (no `Types.ObjectId`)
- [ ] Read `src/app/repositories/repository.ts` fully
- [ ] Read `src/app/repositories/licensee.ts` as a representative concrete repo
- [ ] Read `docs/kb/architecture/dependency-injection-runtime-wiring.md`
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/repositories/repository.ts` | modify | Define `IRepository<T>`; make base generic; `.lean()` on reads; `.toObject()` on creates; remove `save()` from `IRepository<T>` |
| `src/app/repositories/licensee.ts` | modify | Type with `ILicensee`; override methods to return `ILicensee` |
| `src/app/repositories/contact.ts` | modify | Type with `IContact` |
| `src/app/repositories/message.ts` | modify | Type with `IMessage` |
| `src/app/repositories/body.ts` | modify | Type with `IBody` |

### Do NOT Modify

- `src/app/repositories/room.ts`, `src/app/repositories/trigger.ts`, `src/app/repositories/user.ts` — owned by phase-2/task-05
- `src/app/usecases/*` — Phase 2 task-06/task-07 ownership
- `src/app/controllers/*` — Phase 3 ownership

## Implementation Steps

### Step 1: Define `IRepository<T>`

In `repository.ts`, define and export the public contract that use cases depend on:

```ts
export interface IRepository<T> {
  findFirst(params?: Record<string, unknown>, relations?: string[]): Promise<T | null>
  find(params?: Record<string, unknown>, relations?: string[]): Promise<T[]>
  create(fields: Partial<T>): Promise<T>
  update(id: string, fields: Partial<T>): Promise<{ acknowledged: boolean }>
  updateMany(params: Record<string, unknown>, fields: Partial<T>): Promise<{ acknowledged: boolean }>
  delete(params: Record<string, unknown>): Promise<{ acknowledged: boolean }>
}
```

Note: `save(document)` is intentionally absent from `IRepository<T>`. It must NOT be part of the contract.

### Step 2: Make `Repository` generic with POJO returns

Update the `Repository` base class to use `T` and return plain objects:

```ts
class Repository<T> implements IRepository<T> {
  async findFirst(params = {}, relations: string[] = []): Promise<T | null> {
    const query = this.model().findOne(params).lean()
    relations.forEach((r) => query.populate(r))
    const doc = await query
    if (!doc) return null
    return { ...doc, _id: doc._id.toString() } as T
  }

  async find(params = {}, relations: string[] = []): Promise<T[]> {
    const query = this.model().find(params).lean()
    relations.forEach((r) => query.populate(r))
    const docs = await query
    return docs.map((doc) => ({ ...doc, _id: doc._id.toString() })) as T[]
  }

  async create(fields = {}): Promise<T> {
    const doc = await this.model().create(fields)
    const obj = doc.toObject()
    return { ...obj, _id: obj._id.toString() } as T
  }
}
```

**Why the explicit `_id.toString()`**: `.lean()` and `.toObject()` return `_id` as a `mongodb.ObjectId` at runtime even though the interface declares `_id: string`. Without this conversion, comparisons like `contact._id === someStringId` silently return `false`, causing subtle lookup bugs that unit tests with `RepositoryMemory` will not catch (since memory repos already generate string IDs).

Keep `save(document)` on the `Repository` class as an internal/protected method if `RepositoryMemory` needs it — but do NOT include it in `IRepository<T>`.

### Step 3: Update `RepositoryMemory`

`RepositoryMemory` already returns POJOs. Ensure it implements `IRepository<T>` and its method signatures match. The `hydrate()` method adds a `.save()` shim for legacy test compatibility — keep it for now but document that it is temporary.

### Step 4: Type core concrete repos

For each core repo, declare the type parameter:

```ts
class LicenseeRepositoryDatabase extends Repository<ILicensee> {
  model() { return Licensee }
  // override findFirst/find/create only if additional logic needed
}

class LicenseeRepositoryMemory extends RepositoryMemory<ILicensee> { ... }
```

### Step 5: Typecheck

Run `npx tsc --noEmit`. Expect errors in use cases/controllers that call `document.save()` — those are Phase 2/3 tasks to fix. Document which files have remaining errors in `status.md`. Do not suppress with `as any`.

## Testing

- [ ] `npx tsc --noEmit` passes (or remaining errors are only in Phase 2/3 files — document which)
- [ ] `NODE_ENV=test npx jest --testPathPattern="repositories/(licensee|contact|message|body)" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required — pattern is documented in `overview.md`

## Completion Criteria

- [ ] `IRepository<T>` exported from `repository.ts` with no `save()` method
- [ ] `Repository<T>` base class returns POJOs — `findFirst`/`find` use `.lean()`, `create` uses `.toObject()`
- [ ] `_id` is explicitly converted to `string` via `.toString()` in `findFirst`, `find`, and `create` — never rely on TypeScript cast alone
- [ ] `RepositoryMemory<T>` implements `IRepository<T>`
- [ ] licensee, contact, message, body repos typed with their interfaces
- [ ] All relevant repository tests pass
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-backend/phase-2`
