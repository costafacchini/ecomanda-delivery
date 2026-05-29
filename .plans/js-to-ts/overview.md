# Plan: JS to TypeScript Migration

**Status**: not-started
**Created**: 2026-04-02
**Last Updated**: 2026-04-28
**Assigned Dev**: Alan
**Master Plan**: None

## Objective

Migrate the entire codebase (backend + client) from JavaScript to TypeScript incrementally using `allowJs: true`, keeping the project running throughout. No big-bang rewrite — one layer per task, each task is a reviewable and mergeable unit.

## Scope

### In Scope
- Backend TypeScript tooling (tsconfig, babel transform, CI typecheck script)
- Shared domain types in `src/types/index.ts`
- Bottom-up backend migration: helpers, config, models, repositories, queries, services, plugins, importers, factories, controllers, jobs, routes, entry points
- Client migration: tsconfig, services, contexts, components, pages, root files
- Strict mode tightening (`noImplicitAny`, `strict: true`) as a final phase
- ESLint TypeScript rules enabled after strict mode passes

### Out of Scope
- Changing business logic during rename — {each file rename is type-annotation-only, no logic changes}
- Removing `allowJs` before Phase 5 is complete — {coexistence is required throughout Phases 1–4}

## Kill Criteria

- If Mongoose schema typing complexity blocks progress for more than 2 weeks with no viable workaround.
- If `allowJs` coexistence causes Jest transform failures that cannot be resolved within the tooling task.

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 0 | Prerequisites | task-00 | None | Verify cra-to-vite migration is complete (already satisfied) |
| 1 | Backend Tooling | task-01, task-02, task-03, task-04 | None | Install TS deps, tsconfig, Jest/Babel transform, CI typecheck |
| 2 | Shared Domain Types | task-05, task-06, task-07 | Phase 1 | Create `src/types/index.ts`, migrate helpers and config |
| 3 | Backend Layers | task-08 through task-20 | Phase 2 | Bottom-up migration of all backend source files |
| 4 | Client Migration | task-21 through task-26 | Phase 0 + Phase 1 | Migrate all client source files |
| 5 | Strict Mode | task-27, task-28, task-29, task-30 | Phase 3 + Phase 4 | Enable noImplicitAny and strict; add ESLint TS rules |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-0/task-00-verify-cra-to-vite-complete | Verify cra-to-vite prerequisite is complete | 0 | complete | — |
| phase-1/task-01-backend-ts-deps | Install backend TypeScript dependencies | 1 | complete | — |
| phase-1/task-02-tsconfig-root | Create root tsconfig.json | 1 | complete | phase-1/task-01-backend-ts-deps |
| phase-1/task-03-jest-babel-ts-transform | Configure Jest/Babel to process .ts files | 1 | complete | phase-1/task-01-backend-ts-deps |
| phase-1/task-04-typecheck-ci-script | Add typecheck script and verify zero TS errors | 1 | not-started | phase-1/task-02-tsconfig-root |
| phase-2/task-05-domain-types | Create src/types/index.ts with domain enums and interfaces | 2 | not-started | phase-1/task-02-tsconfig-root |
| phase-2/task-06-migrate-helpers | Migrate src/app/helpers/ to .ts | 2 | not-started | phase-2/task-05-domain-types |
| phase-2/task-07-migrate-config-setup | Migrate src/config/ and src/setup/ to .ts | 2 | not-started | phase-1/task-02-tsconfig-root |
| phase-3/task-08-migrate-models | Migrate Mongoose models to .ts | 3 | not-started | phase-2/task-05-domain-types |
| phase-3/task-09-migrate-repositories | Migrate repositories to .ts | 3 | not-started | phase-3/task-08-migrate-models |
| phase-3/task-10-migrate-queries | Migrate queries layer to .ts | 3 | not-started | phase-3/task-09-migrate-repositories |
| phase-3/task-11-migrate-services | Migrate services layer to .ts | 3 | not-started | phase-3/task-09-migrate-repositories |
| phase-3/task-12-migrate-messenger-plugins | Migrate plugins/messengers to .ts | 3 | not-started | phase-3/task-11-migrate-services |
| phase-3/task-13-migrate-chat-plugins | Migrate plugins/chats to .ts | 3 | not-started | phase-3/task-11-migrate-services |
| phase-3/task-14-migrate-chatbot-plugins | Migrate plugins/chatbots to .ts | 3 | not-started | phase-3/task-11-migrate-services |
| phase-3/task-15-migrate-cart-plugins | Migrate plugins/carts to .ts | 3 | not-started | phase-3/task-11-migrate-services |
| phase-3/task-16-migrate-integration-payment-storage-plugins | Migrate plugins/integrations, payments, and storage to .ts | 3 | not-started | phase-3/task-11-migrate-services |
| phase-3/task-17-migrate-importers-factories-reports | Migrate importers, factories, and reports to .ts | 3 | not-started | phase-3/task-08-migrate-models |
| phase-3/task-18-migrate-controllers | Migrate controllers to .ts | 3 | not-started | phase-3/task-11-migrate-services |
| phase-3/task-19-migrate-jobs | Migrate jobs to .ts | 3 | not-started | phase-3/task-11-migrate-services, phase-3/task-12-migrate-messenger-plugins, phase-3/task-13-migrate-chat-plugins |
| phase-3/task-20-migrate-routes-websockets-entry | Migrate routes, websockets, and server entry to .ts | 3 | not-started | phase-3/task-18-migrate-controllers |
| phase-4/task-21-client-ts-setup | Add client TS deps and create client/tsconfig.json | 4 | not-started | phase-0/task-00-verify-cra-to-vite-complete, phase-1/task-01-backend-ts-deps |
| phase-4/task-22-migrate-client-services | Migrate client/src/services/ to .ts | 4 | not-started | phase-4/task-21-client-ts-setup |
| phase-4/task-23-migrate-client-contexts | Migrate client/src/contexts/ to .tsx | 4 | not-started | phase-4/task-21-client-ts-setup |
| phase-4/task-24-migrate-client-components | Migrate client/src/components/ to .tsx | 4 | not-started | phase-4/task-23-migrate-client-contexts |
| phase-4/task-25-migrate-client-pages | Migrate client/src/pages/ to .tsx | 4 | not-started | phase-4/task-24-migrate-client-components |
| phase-4/task-26-migrate-client-root | Migrate App.js, index.js, and root client files to .tsx | 4 | not-started | phase-4/task-25-migrate-client-pages |
| phase-5/task-27-enable-noimplicitany-backend | Enable noImplicitAny on backend tsconfig | 5 | not-started | phase-3/task-20-migrate-routes-websockets-entry |
| phase-5/task-28-enable-noimplicitany-client | Enable noImplicitAny on client tsconfig | 5 | not-started | phase-4/task-26-migrate-client-root |
| phase-5/task-29-enable-strict-mode | Enable strict: true in both tsconfigs | 5 | not-started | phase-5/task-27-enable-noimplicitany-backend, phase-5/task-28-enable-noimplicitany-client |
| phase-5/task-30-eslint-ts-rules | Enable @typescript-eslint/recommended rules in ESLint | 5 | not-started | phase-5/task-29-enable-strict-mode |

## Branch Convention

Pattern: `plan/js-to-ts/phase-{N}/task-{NN}-{slug}`
Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/` | All backend source files (187 .js source, 118 test files) |
| `client/src/` | All client source files (62 .js source, 30 test files) |
| `babel.config.json` | Needs `@babel/preset-typescript` added for Jest |
| `jest.config.mjs` | Transform pattern must cover `.ts` files |
| `package.json` | New TS deps and typecheck script |
| `tsconfig.json` | New root-level file for backend |
| `client/tsconfig.json` | New client-level file |

## Defects

| Defect Task | Title | Found During | Blocks | Status |

## Sequencing with Active Feature Plans

Three feature plans (`setores`, `baileys-socket-monitor`, `local-chat-infra`) are in progress and will add new `.js` backend files (models, services, controllers, plugins). This creates two valid execution strategies:

**Option A — js-to-ts after all feature plans** (recommended): Wait until all three feature plans are merged, then run js-to-ts. Phase 3 tasks will cover the full final file set in one pass. No merge conflicts with feature branches.

**Option B — Phase 1 now, rest later**: Phases 1–2 (tooling, shared types) touch no feature-plan files and can start immediately in parallel with feature plan work. Pause at Phase 3 until feature plans are complete.

Do NOT start Phase 3 or 4 while a feature branch that adds new `.js` files is open — that guarantees merge conflicts.

## Parallelization Opportunities in Phase 3

Tasks 12–16 (messenger, chat, chatbot, cart, integration/payment/storage plugins) all depend only on task-11 and are independent of each other — they can run in parallel across separate branches if desired.

## Risks

- Mongoose model types are complex (dynamic validators, virtuals) — Use `mongoose` generic types (`Schema<ILicensee>`); keep validators untyped initially
- 30+ plugin files with deep inheritance chains — Migrate Base class first, then subclasses in the same task
- `allowJs` means no type-checking on unmigrated files — Acceptable; `tsc --noEmit` only errors on `.ts` files
- Circular imports may surface as TS errors — Investigate with `madge` if errors appear
- `_moduleAliases` vs `paths` divergence — tsconfig `paths` must include all aliases from `_moduleAliases` **and** jest `moduleNameMapper` (notably `@factories`, which is in jest but not in `_moduleAliases`)

## Success Criteria

- [ ] All `.js` source files renamed to `.ts` / `.tsx`
- [ ] All `.spec.js` test files renamed to `.spec.ts`
- [ ] `tsc --noEmit` passes with `strict: true` on both tsconfigs
- [ ] `yarn test` (backend) passes (2611 tests)
- [ ] `vitest run` (client) passes
- [ ] `vite build` succeeds
- [ ] ESLint passes with TypeScript rules enabled
- [ ] All tests pass
- [ ] No regressions in existing functionality
