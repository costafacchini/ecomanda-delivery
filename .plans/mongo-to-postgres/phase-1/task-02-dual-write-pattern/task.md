# Task: DualWriteRepository pattern + PrismaRepository base

**Plan**: MongoDB → PostgreSQL Migration
**Phase**: 1
**Task ID (phase-local)**: task-02
**Task Path**: phase-1/task-02-dual-write-pattern
**Depends On**: None (parallel with task-01, but consumes `getPrismaClient` from task-01 — stub if needed)
**JIRA**: N/A

## Objective

Create the `PrismaRepository` base class and the `DualWriteRepository` adapter in `src/app/repositories/repository.js`. These are the reusable building blocks all Phase 2 and Phase 3 tasks will extend. Add test utilities that let specs assert against both stores simultaneously.

## Context

The existing `Repository` base class in `src/app/repositories/repository.js` is Mongoose-backed. `RepositoryMemory` is an in-memory stub for tests and must remain unchanged — it is used by every existing spec.

The dual-write strategy:
- **Writes**: sent to both Mongoose (primary) and Prisma (secondary, async fire-and-forget during pilot; upgraded to sync in Phase 3+)
- **Reads**: served from Mongoose until Phase 4 explicitly flips them

Each concrete model repository will have two implementations:
1. `Database{Model}Repository` (existing, Mongoose-based) — unchanged
2. `PrismaDatabase{Model}Repository` — new, Prisma-based

A `DualWriteRepository` wrapper takes both and implements the `Repository` interface, routing writes to both and reads to the primary (Mongo) store.

Architecture doc: `docs/kb/architecture/dependency-injection-runtime-wiring.md`

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Check that `phase-1/task-01-prisma-setup` is complete or at least has `src/config/postgres.js` stubbed so `getPrismaClient` is importable. If not, stub the import yourself.
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Read `docs/kb/architecture/dependency-injection-runtime-wiring.md`
- [ ] Read `src/app/repositories/repository.js` in full before writing any code
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/repositories/repository.js` | modify | Add `PrismaRepository` class and `DualWriteRepository` wrapper at the bottom; do NOT touch existing `Repository` or `RepositoryMemory` |
| `src/app/repositories/testing.js` | modify | Add `DualWriteRepositoryMemory` test helper if needed |

### Do NOT Modify

- `src/config/postgres.js` — owned by task-01
- `prisma/schema.prisma` — owned by task-01
- `src/config/database.js` — owned by task-01
- `src/app/repositories/index.js` — not touched in Phase 1; each model task owns its entry

## Implementation Steps

### Step 1: Add PrismaRepository base class

Each Postgres table has:
- `id` — `SERIAL` primary key (auto-generated integer)
- `mongo_id` — `VARCHAR(24) UNIQUE NOT NULL` — stores the Mongo `_id` for cross-reference

The `PrismaRepository` base class uses `mongo_id` as the lookup key for upsert operations during the dual-write window (since Mongo is the source of truth and all incoming operations carry `_id`).

Append to `src/app/repositories/repository.js`:

```js
class PrismaRepository {
  /**
   * @returns the Prisma model delegate, e.g. getPrismaClient().licensee
   */
  delegate() {
    throw new Error('PrismaRepository.delegate() must be implemented by subclass')
  }

  async findFirst(params = {}) {
    return await this.delegate().findFirst({ where: this.#toWhere(params) })
  }

  async create(fields = {}) {
    return await this.delegate().create({ data: this.#toData(fields) })
  }

  async update(id, fields = {}) {
    // id here is the Mongo _id; look up via mongo_id
    return await this.delegate().updateMany({
      where: { mongo_id: id.toString() },
      data: fields ?? {},
    })
  }

  async updateMany(params = {}, fields = {}) {
    return await this.delegate().updateMany({
      where: this.#toWhere(params),
      data: fields ?? {},
    })
  }

  async find(params = {}) {
    return await this.delegate().findMany({ where: this.#toWhere(params) })
  }

  async delete(params = {}) {
    return await this.delegate().deleteMany({ where: this.#toWhere(params) })
  }

  async save(document) {
    const mongoId = (document._id ?? document.mongo_id)?.toString()
    const data = this.#toData(document)
    return await this.delegate().upsert({
      where: { mongo_id: mongoId },
      create: data,
      update: data,
    })
  }

  // Translates Mongo _id references to mongo_id for Prisma queries
  #toWhere(params = {}) {
    if (!params || typeof params !== 'object') return params
    const result = {}
    for (const [key, value] of Object.entries(params)) {
      if (key === '_id') {
        result.mongo_id = value?.toString()
      } else {
        result[key] = value
      }
    }
    return result
  }

  // Strips Mongoose internals and maps _id → mongo_id
  #toData(fields = {}) {
    const plain = fields?.toObject
      ? fields.toObject({ depopulate: true, versionKey: false, virtuals: false })
      : { ...(fields ?? {}) }
    const { _id, __v, id, ...rest } = plain
    return { mongo_id: (_id ?? fields.mongo_id)?.toString(), ...rest }
  }
}
```

Note: `id` (the Postgres SERIAL) is never set by application code — Postgres generates it. All lookups during the dual-write window use `mongo_id`.

### Step 2: Add DualWriteRepository wrapper

```js
class DualWriteRepository {
  /**
   * @param {Repository} primary - Mongoose-backed repo (source of truth for reads)
   * @param {PrismaRepository} secondary - Prisma-backed repo (write target)
   * @param {object} options
   * @param {boolean} options.asyncSecondary - fire-and-forget secondary writes (default: true)
   */
  constructor(primary, secondary, { asyncSecondary = true } = {}) {
    this.primary = primary
    this.secondary = secondary
    this.asyncSecondary = asyncSecondary
  }

  async #writeSecondary(fn) {
    if (this.asyncSecondary) {
      fn().catch((err) => console.error('[DualWrite] Secondary write failed:', err.message))
    } else {
      await fn()
    }
  }

  async findFirst(params = {}, relations = []) {
    return await this.primary.findFirst(params, relations)
  }

  async find(params = {}, relations = []) {
    return await this.primary.find(params, relations)
  }

  async create(fields = {}) {
    const result = await this.primary.create(fields)
    await this.#writeSecondary(() => this.secondary.save(result))
    return result
  }

  async update(id, fields = {}) {
    const result = await this.primary.update(id, fields)
    await this.#writeSecondary(() => this.secondary.update(id, fields))
    return result
  }

  async updateMany(params = {}, fields = {}) {
    const result = await this.primary.updateMany(params, fields)
    await this.#writeSecondary(() => this.secondary.updateMany(params, fields))
    return result
  }

  async delete(params = {}) {
    const result = await this.primary.delete(params)
    await this.#writeSecondary(() => this.secondary.delete(params))
    return result
  }

  async save(document) {
    const result = await this.primary.save(document)
    await this.#writeSecondary(() => this.secondary.save(result))
    return result
  }
}
```

`DualWriteRepository.create` and `save` pass the Mongoose result directly to `secondary.save()`. Because `PrismaRepository.save()` upserts on `mongo_id`, the Postgres side always stays in sync without needing a separate ID translation step here.

### Step 3: Export new classes

Update the `export` line at the bottom of `repository.js`:
```js
export default Repository
export { RepositoryMemory, DualWriteRepository, PrismaRepository, buildMemoryRecord, comparableValue, matchesFilter, sortRecords }
```

### Step 4: Add tests for DualWriteRepository

Create or update a test file `src/app/repositories/dual-write.spec.js`:
- Test that `create` calls both primary and secondary
- Test that when `asyncSecondary = true`, a secondary failure does NOT throw (fire-and-forget)
- Test that `findFirst` and `find` only hit the primary
- Test that `update`, `delete`, `save` call both stores
- Use `RepositoryMemory` instances for both primary and secondary in tests

## Testing

- [ ] `src/app/repositories/dual-write.spec.js` passes
- [ ] All existing repository specs still pass (RepositoryMemory is unchanged)
- [ ] `npx jest src/app/repositories/` exits 0
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] After task completes, run `document-solution` — the DualWriteRepository pattern is non-obvious and should be documented in `docs/kb/architecture/`
- [ ] Run `check-kb-index` after KB doc is created

## Completion Criteria

- [ ] `PrismaRepository` class added to `repository.js`
- [ ] `DualWriteRepository` class added to `repository.js`
- [ ] Both exported from `repository.js`
- [ ] `dual-write.spec.js` written and passing
- [ ] No regressions in existing repository specs
- [ ] Changes committed to `plan/mongo-to-postgres/phase-1/task-02-dual-write-pattern` branch
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- task-01 owns `src/config/postgres.js`. Import `getPrismaClient` from that file; if task-01 is not yet merged, add a TODO comment and stub the import.
- Do not touch `src/app/repositories/index.js` — model tasks in Phase 2/3 own their own index entries.
