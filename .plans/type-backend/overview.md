# Plan: Backend Type Narrowing

**Status**: not-started
**Created**: 2026-05-31
**Last Updated**: 2026-08-07 (revised: remove-pdv complete; setores models added; Wevo→Utalk; repository anti-corruption layer pattern added)
**Estimated Demo Date**: N/A
**Assigned Dev**: Alan Costa Facchini
**Assigned QA**: unassigned

## Objective

Replace the `any` types introduced during the JS→TS migration with specific interfaces and concrete types across the backend, working layer by layer from Mongoose models inward through repositories, use cases, controllers, and plugin boundaries.

## Scope

### In Scope
- Mongoose model interfaces (`ILicensee`, `IContact`, `IMessage`, etc.) in `src/app/models/`
- Repository method signatures (`findFirst`, `findAll`, `create`, `update`) in `src/app/repositories/`
- Use case input/output types in `src/app/usecases/`
- Query builder and query class types in `src/app/queries/`
- Controller handler parameter and response types in `src/app/controllers/`
- Messenger plugin method signatures in `src/app/plugins/messengers/`
- Chat plugin method signatures in `src/app/plugins/chats/`
- Helper and service utility types in `src/app/helpers/` and `src/app/services/`

### Out of Scope
- **PDV-related types (Cart, Order, Product, PagarMe)** — deleted by `remove-pdv` plan (complete). Do not create these types.
- **Client-side typing** — covered by the companion `type-client` plan.
- **Third-party package type augmentations** — no `@types/*` packages will be installed; `src/declarations.d.ts` stubs remain.
- **Test files** — spec files retain `any` freely; only production code is in scope.

## Architectural Pattern: Repository as Anti-Corruption Layer

**This constraint applies to every task in the plan.**

The repository layer must be the only place in the codebase that knows about Mongoose. Everything above it (use cases, controllers, plugins, helpers) must receive and operate on plain domain objects — not Mongoose Documents.

### Domain interfaces must be database-agnostic

`src/types/index.ts` must NOT import from `mongoose`. Use `string` for `_id` and FK reference fields:

```ts
// WRONG — couples interfaces to Mongoose
import { Types } from 'mongoose'
export interface ILicensee {
  _id: Types.ObjectId
  contact: Types.ObjectId | IContact
}

// CORRECT — plain domain interface
export interface ILicensee {
  _id: string
  contact: string | IContact
}
```

### Repositories must return plain objects, not Mongoose Documents

Database repository methods must convert results before returning:
- **Read** (`findFirst`, `find`): use `.lean()` on Mongoose queries, then explicitly convert `_id` to string
- **Create**: call `.toObject()` on the created document, then explicitly convert `_id` to string
- **Update**: return `{ acknowledged: true }` — no document needed

**Critical**: `.lean()` and `.toObject()` return `_id` as `mongodb.ObjectId` at runtime, not `string`. A TypeScript cast (`as ILicensee`) silently lies. Always call `_id.toString()` explicitly — otherwise `contact._id === someStringId` will always be `false` in production.

```ts
async findFirst(params = {}): Promise<ILicensee | null> {
  const doc = await Licensee.findOne(params).lean()
  if (!doc) return null
  return { ...doc, _id: doc._id.toString() }
}

async create(fields = {}): Promise<ILicensee> {
  const doc = await Licensee.create(fields)
  const obj = doc.toObject()
  return { ...obj, _id: obj._id.toString() }
}
```

### Remove `save()` from the public repository contract

`IRepository<T>` must NOT expose `save(document)`. This method couples callers to Mongoose Document lifecycle. Use cases that currently call `document.save()` must be refactored to call `repo.update(id, fields)` instead.

The `RepositoryMemory` already implements this pattern via `serializeInput()` — the Database implementation needs to match.

### Why this matters

When `mongo-to-postgres` executes, only the repository implementations change. Use cases, controllers, and plugins remain untouched because they never held a Mongoose Document — they always had plain `ILicensee`, `IMessage`, etc.

## Prerequisite State

- `js-to-ts` — complete (2026-05-31)
- `remove-pdv` — complete (2026-06-05); Cart, Order, Product, Integrationlog, Backgroundjob deleted
- `setores` — complete (2026-07-17); Department and Inbox models/repos added
- `src/types/index.ts` — already exists with partial content: `ILicensee`, `IContact`, `IMessage`, `IRoom`, `ITrigger` and 7 enums defined. Tasks extend this file, not create from scratch.

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Model Interfaces | task-01, task-02, task-03 | None | Define TypeScript interfaces for all Mongoose models — the foundation everything else builds on |
| 2 | Repositories & Use Cases | task-04, task-05, task-06, task-07 | Phase 1 | Type repository method signatures and use case inputs/outputs using the interfaces from Phase 1 |
| 3 | Controllers, Queries & Plugins | task-08, task-09, task-10, task-11 | Phase 2 | Type query classes, controllers, and plugin boundaries using repository return types from Phase 2 |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-core-model-interfaces | Core Model Interfaces | 1 | not-started | — |
| phase-1/task-02-setores-session-model-interfaces | Setores & Session Model Interfaces | 1 | not-started | — |
| phase-1/task-03-system-model-interfaces | System Model Interfaces | 1 | not-started | — |
| phase-2/task-04-core-repositories | Core Repository Types | 2 | not-started | phase-1/task-01-core-model-interfaces |
| phase-2/task-05-remaining-repositories | Remaining Repository Types | 2 | not-started | phase-1/task-02-setores-session-model-interfaces, phase-1/task-03-system-model-interfaces |
| phase-2/task-06-message-contact-usecases | Message & Contact Use Case Types | 2 | not-started | phase-2/task-04-core-repositories |
| phase-2/task-07-remaining-usecases | Remaining Use Case Types | 2 | not-started | phase-2/task-04-core-repositories, phase-2/task-05-remaining-repositories |
| phase-3/task-08-queries | Query Class Types | 3 | not-started | phase-2/task-04-core-repositories, phase-2/task-05-remaining-repositories |
| phase-3/task-09-controllers | Controller Types | 3 | not-started | phase-2/task-06-message-contact-usecases, phase-2/task-07-remaining-usecases |
| phase-3/task-10-messenger-plugins | Messenger Plugin Types | 3 | not-started | phase-2/task-04-core-repositories |
| phase-3/task-11-chat-plugins-helpers | Chat Plugin & Helper Types | 3 | not-started | phase-2/task-04-core-repositories |

## Branch Convention

One branch per phase — tasks within a phase are committed sequentially to the same branch. Each phase produces one PR to `main`.

| Branch | Tasks | PR |
|--------|-------|----|
| `plan/type-backend/phase-1` | task-01, task-02, task-03 | PR 1 |
| `plan/type-backend/phase-2` | task-04, task-05, task-06, task-07 | PR 2 |
| `plan/type-backend/phase-3` | task-08, task-09, task-10, task-11 | PR 3 |

Base branch: `main`

Each phase branch is created from `main` after the previous phase PR is merged. Tasks within a phase are worked sequentially, each committed to the phase branch. The PR is opened after all tasks in the phase are complete.

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/types/index.ts` | Already exists with partial interfaces — extend, do not recreate |
| `src/app/models/` | 12 Mongoose models — source of truth for domain shapes; Phase 1 defines interfaces here |
| `src/app/repositories/repository.ts` | Base repository class — Phase 2 types its generic signatures |
| `src/app/repositories/*.ts` | One file per entity — Phase 2 narrows return types |
| `src/app/usecases/` | 9 domain subdirectories — Phase 2 types inputs and outputs |
| `src/app/queries/` | QueryBuilder, MessagesQuery, LicenseeMessagesByDayQuery, and 7 other query classes — Phase 3 |
| `src/app/controllers/` | All Express controllers — Phase 3 |
| `src/app/plugins/messengers/` | Baileys, Dialog, YCloud, Pabbly, Utalk — Phase 3 |
| `src/app/plugins/chats/` | Chatwoot, Crisp, Cuboup, LocalChat, Rocketchat — Phase 3 |
| `src/app/helpers/` | Files.ts, SanitizeErrors.ts, NormalizePhone.ts, Emoji.ts, etc. — Phase 3 |

## Risks

- **mongo-to-postgres timeline** — Mongoose interfaces defined here will need to be replaced with Prisma types. Mitigation: keep interfaces in `src/types/` for easier migration; interface names (`ILicensee`, etc.) can be reused by Prisma counterparts.
- **Scope creep per task** — Tasks own specific files; don't fix adjacent files not in the ownership table.
- **Partial `src/types/index.ts`** — 5 interfaces already exist. Task-01 must not overwrite them; extend only.

## Success Criteria

- [ ] All 12 Mongoose models have a corresponding `I{Model}` interface exported from `src/types/`
- [ ] All repository `findFirst`, `findAll`, `create`, `update` methods return typed results (no `any` in return type positions)
- [ ] All use case `execute()` methods have typed inputs and outputs
- [ ] All controller handlers have typed `req`, `res` parameters (no `Request<any, any, any>`)
- [ ] Query classes have typed `filter`, `sort`, and result methods
- [ ] Plugin `sendMessage`, `responseToMessages` methods have typed signatures
- [ ] `npx tsc --noEmit` passes with no new errors
- [ ] All existing tests pass
- [ ] No regressions in existing functionality

## References

- **JIRA Epic**: N/A
- **Weekly Plan Brief**: N/A
- **Related Plans**: [JS → TypeScript](../js-to-ts/overview.md) (prerequisite, complete), [Remove PDV](../remove-pdv/overview.md) (complete — PDV models gone), [MongoDB → PostgreSQL](../mongo-to-postgres/overview.md) (downstream consumer of these interfaces)
