# Plan: Backend Type Narrowing

**Status**: not-started
**Created**: 2026-05-31
**Last Updated**: 2026-05-31
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
- **PDV-related types (Cart, Order, Product, PagarMe)** — the `remove-pdv` plan will delete these entirely; typing them now creates wasted work. Stub with `any` and note the dependency.
- **Client-side typing** — covered by the companion `type-client` plan.
- **Third-party package type augmentations** — no `@types/*` packages will be installed; `src/declarations.d.ts` stubs remain.
- **Test files** — spec files retain `any` freely; only production code is in scope.

## Kill Criteria

- If `remove-pdv` executes before this plan completes, reassess task-02 (transactional models) to avoid typing code slated for deletion.
- If `mongo-to-postgres` begins before Phase 1 completes, Mongoose interfaces should be designed compatible with the Prisma migration path.

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
| phase-1/task-02-transactional-model-interfaces | Transactional Model Interfaces | 1 | not-started | — |
| phase-1/task-03-system-model-interfaces | System Model Interfaces | 1 | not-started | — |
| phase-2/task-04-core-repositories | Core Repository Types | 2 | not-started | phase-1/task-01-core-model-interfaces |
| phase-2/task-05-remaining-repositories | Remaining Repository Types | 2 | not-started | phase-1/task-02-transactional-model-interfaces, phase-1/task-03-system-model-interfaces |
| phase-2/task-06-message-contact-usecases | Message & Contact Use Case Types | 2 | not-started | phase-2/task-04-core-repositories |
| phase-2/task-07-remaining-usecases | Remaining Use Case Types | 2 | not-started | phase-2/task-04-core-repositories, phase-2/task-05-remaining-repositories |
| phase-3/task-08-queries | Query Class Types | 3 | not-started | phase-2/task-04-core-repositories, phase-2/task-05-remaining-repositories |
| phase-3/task-09-controllers | Controller Types | 3 | not-started | phase-2/task-06-message-contact-usecases, phase-2/task-07-remaining-usecases |
| phase-3/task-10-messenger-plugins | Messenger Plugin Types | 3 | not-started | phase-2/task-04-core-repositories |
| phase-3/task-11-chat-plugins-helpers | Chat Plugin & Helper Types | 3 | not-started | phase-2/task-04-core-repositories |

## Branch Convention

Pattern: `plan/type-backend/{task-path}`

Example branches:
- `plan/type-backend/phase-1/task-01-core-model-interfaces`
- `plan/type-backend/phase-2/task-04-core-repositories`
- `plan/type-backend/phase-3/task-09-controllers`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/app/models/` | 15 Mongoose models — source of truth for domain shapes; Phase 1 defines interfaces here |
| `src/app/repositories/repository.ts` | Base repository class — Phase 2 types its generic signatures |
| `src/app/repositories/*.ts` | One file per entity — Phase 2 narrows return types |
| `src/app/usecases/` | 10 domain subdirectories — Phase 2 types inputs and outputs |
| `src/app/queries/` | QueryBuilder, MessagesQuery, BillingQuery, etc. — Phase 3 |
| `src/app/controllers/` | All Express controllers — Phase 3 |
| `src/app/plugins/messengers/` | Baileys, Dialog, YCloud, Pabbly, Wevo — Phase 3 |
| `src/app/plugins/chats/` | Chatwoot, Crisp — Phase 3 |
| `src/app/helpers/` | Files.ts, SanitizeErrors.ts, NormalizePhone.ts, etc. — Phase 3 |
| `src/types/` | New directory for shared backend interfaces (created in Phase 1) |

## Risks

- **remove-pdv overlap** — Task-02 types Cart/Order/Product; if `remove-pdv` runs first these types become dead code. Mitigation: track `remove-pdv` status before starting task-02.
- **mongo-to-postgres timeline** — Mongoose interfaces defined here will need to be replaced with Prisma types. Mitigation: keep interfaces in a separate `src/types/` directory for easier migration.
- **Scope creep per task** — Each layer has 100–180 `any` occurrences. Mitigation: tasks own specific files; don't fix adjacent files not in the ownership table.

## Success Criteria

- [ ] All Mongoose models have a corresponding `I{Model}` interface exported from `src/types/`
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
- **Related Plans**: [JS → TypeScript](../js-to-ts/overview.md) (prerequisite, complete), [Remove PDV](../remove-pdv/overview.md) (affects task-02 scope), [MongoDB → PostgreSQL](../mongo-to-postgres/overview.md) (downstream consumer of these interfaces)
