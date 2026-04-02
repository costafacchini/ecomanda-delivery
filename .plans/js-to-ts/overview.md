# Plan: Migrate project to TypeScript

**Created**: 2026-04-02
**Status**: Draft
**Branch**: feature/js-to-ts
**Prerequisite**: `.plans/cra-to-vite` must be complete before Phase 4 (client)

## Objective

Migrate the entire codebase (backend + client) from JavaScript to TypeScript incrementally,
using `allowJs: true` to keep the project running throughout — no big-bang rewrite.

## Scope

| Area | Source files | Test files |
|------|-------------|------------|
| Backend (`src/`) | 187 | 118 |
| Client (`client/src/`) | 62 | 30 |
| **Total** | **249** | **148** |

## Strategy

- **Incremental / bottom-up**: migrate leaf modules first (helpers, types, models), then consumers
- **allowJs: true** during migration — JS and TS files coexist; rename one group at a time
- **Lenient tsconfig first** (`strict: false`, `noImplicitAny: false`); tighten in Phase 5
- **Tests stay as-is** until their source file is migrated; rename `.spec.js` → `.spec.ts` in same PR
- **One layer per task** — each task is a reviewable, mergeable unit

---

## Phase 0 — Prerequisites

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 0.1 | Complete CRA→Vite migration | Pending | see `.plans/cra-to-vite` | — |

---

## Phase 1 — Backend Tooling

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 1.1 | Add backend TS deps: `typescript`, `tsx`, `@types/node`, `@types/express`, `@types/bcrypt`, `@types/morgan`, `@types/jsonwebtoken`; install `@babel/preset-typescript` for Jest transform | Pending | `package.json` | — |
| 1.2 | Create `tsconfig.json` at root: `allowJs: true`, `checkJs: false`, `strict: false`, `module: NodeNext`, `moduleResolution: NodeNext`, `outDir: dist`, path aliases matching `_moduleAliases` | Pending | `tsconfig.json` *(new)* | 1.1 |
| 1.3 | Update `babel.config.json`: add `@babel/preset-typescript` so Jest can process `.ts` files; update `jest.config.mjs` transform to cover `^.+\.(js\|ts)$` | Pending | `babel.config.json`, `jest.config.mjs` | 1.1 |
| 1.4 | Add `tsc --noEmit` check to CI (`package.json` scripts: `typecheck`); verify zero TS errors on JS-only codebase | Pending | `package.json` | 1.2 |

---

## Phase 2 — Shared Domain Types (Backend)

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 2.1 | Create `src/types/index.ts`: enums for `LicenseKind`, `ChatbotDefault`, `WhatsappDefault`, `ChatDefault`, `CartDefault`, `MessageKind`, `MessageDestination`, `MessageStatus`; interfaces for domain objects (`ILicensee`, `IContact`, `IMessage`, `IRoom`, `ITrigger`) | Pending | `src/types/index.ts` *(new)* | 1.2 |
| 2.2 | Migrate helpers: rename 9 files in `src/app/helpers/` to `.ts`, add types; update imports in consumers | Pending | `src/app/helpers/*.js` → `.ts` + their `.spec.js` → `.spec.ts` | 2.1 |
| 2.3 | Migrate config files: rename 7 files in `src/config/` + `src/setup/` to `.ts` | Pending | `src/config/*.js` → `.ts`, `src/setup/*.js` → `.ts` | 1.2 |

---

## Phase 3 — Backend Layers (bottom-up)

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 3.1 | Migrate Mongoose models (14 files): rename to `.ts`, type schema fields, export typed `Document` interfaces using `mongoose` generics; add `@types/mongoose` if needed | Pending | `src/app/models/*.js` → `.ts` | 2.1 |
| 3.2 | Migrate base `Repository` class and all 10 repository files to `.ts`; type `create/find/update` return values using model interfaces | Pending | `src/app/repositories/*.js` → `.ts` + specs | 3.1 |
| 3.3 | Migrate queries layer (10 files in `src/app/queries/`) to `.ts` | Pending | `src/app/queries/*.js` → `.ts` + specs | 3.2 |
| 3.4 | Migrate services layer (18 files in `src/app/services/`) to `.ts` + specs | Pending | `src/app/services/*.js` → `.ts` + specs | 3.2 |
| 3.5 | Migrate plugins/messengers (6 files + Base) to `.ts` + specs | Pending | `src/app/plugins/messengers/*.js` → `.ts` | 3.4 |
| 3.6 | Migrate plugins/chats (6 files + Base) to `.ts` + specs | Pending | `src/app/plugins/chats/*.js` → `.ts` | 3.4 |
| 3.7 | Migrate plugins/chatbots (2 files) to `.ts` + specs | Pending | `src/app/plugins/chatbots/*.js` → `.ts` | 3.4 |
| 3.8 | Migrate plugins/carts (6 files + adapters) to `.ts` + specs | Pending | `src/app/plugins/carts/**/*.js` → `.ts` | 3.4 |
| 3.9 | Migrate plugins/integrations (8 files) + payments/PagarMe (6 files) + storage (1 file) to `.ts` | Pending | `src/app/plugins/integrations/**/*.js`, `src/app/plugins/payments/**/*.js`, `src/app/plugins/storage/*.js` → `.ts` | 3.4 |
| 3.10 | Migrate importers (2 files), factories (12 files), reports (1 file) to `.ts` | Pending | `src/app/factories/*.js`, `src/app/importers/**/*.js`, `src/app/reports/*.js` → `.ts` | 3.1 |
| 3.11 | Migrate controllers (17 files) to `.ts`: type `Request`/`Response` from Express | Pending | `src/app/controllers/**/*.js` → `.ts` + specs | 3.4 |
| 3.12 | Migrate jobs (20 files) to `.ts` | Pending | `src/app/jobs/*.js` → `.ts` | 3.4, 3.5, 3.6 |
| 3.13 | Migrate routes (5 files) + websockets (3 files) + server entry (`server.js`, `worker.js`) to `.ts` | Pending | `src/app/routes/**/*.js`, `src/app/websockets/**/*.js` → `.ts` | 3.11 |

---

## Phase 4 — Client (requires Vite migration)

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 4.1 | Add client TS deps: `typescript`, `@types/react`, `@types/react-dom`; update `vite.config.js` to handle `.tsx`; create `client/tsconfig.json` (`allowJs: true`, `strict: false`, `jsx: react-jsx`) | Pending | `client/package.json`, `client/tsconfig.json` *(new)*, `client/vite.config.js` | 0.1 |
| 4.2 | Migrate client services and utilities (non-component `.js` files) to `.ts` | Pending | `client/src/services/*.js` → `.ts` + specs | 4.1 |
| 4.3 | Migrate client contexts (`src/contexts/`) to `.tsx` + specs | Pending | `client/src/contexts/**/*.js` → `.tsx` + specs | 4.1 |
| 4.4 | Migrate client components (`src/components/`) to `.tsx` + specs | Pending | `client/src/components/**/*.js` → `.tsx` + specs | 4.3 |
| 4.5 | Migrate client pages (`src/pages/`) to `.tsx` + specs | Pending | `client/src/pages/**/*.js` → `.tsx` + specs | 4.4 |
| 4.6 | Migrate `App.js`, `index.js`, `setupTests.js` and remaining root-level client files | Pending | `client/src/App.js`, `client/src/index.js` → `.tsx` | 4.5 |

---

## Phase 5 — Tighten Strict Mode

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 5.1 | Enable `noImplicitAny: true` in both tsconfigs; fix resulting errors across backend | Pending | `tsconfig.json` | 3.13 |
| 5.2 | Enable `noImplicitAny: true` for client; fix resulting errors | Pending | `client/tsconfig.json` | 4.6 |
| 5.3 | Enable `strict: true` in both tsconfigs; fix `strictNullChecks`, `strictFunctionTypes`, etc. | Pending | `tsconfig.json`, `client/tsconfig.json` | 5.1, 5.2 |
| 5.4 | Update ESLint config: enable `@typescript-eslint/recommended` rules, remove JS-only rules that conflict | Pending | `eslint.config.mjs` | 5.3 |

---

## New Dependencies

**Backend** (`package.json`):
```
typescript, tsx,
@types/node, @types/express, @types/bcrypt, @types/morgan, @types/jsonwebtoken,
@babel/preset-typescript
```

**Client** (`client/package.json`):
```
typescript, @types/react, @types/react-dom
```
_(Vitest handles TS natively; no extra Jest TS transform needed after Vite migration)_

## Risks

| Risk | Mitigation |
|------|------------|
| Mongoose model types are complex (dynamic validators, virtuals) | Use `mongoose` generic types (`Schema<ILicensee>`); keep validators untyped initially |
| 30+ plugin files with deep inheritance chains | Migrate Base class first, then subclasses in same task |
| `allowJs` means no type-checking on unmigrated files | Acceptable — `tsc --noEmit` only errors on `.ts` files |
| Circular imports may surface as TS errors | Investigate with `madge` if errors appear |
| `_moduleAliases` vs `paths` divergence | Mirror exact aliases in `tsconfig.json` `paths` field |

## Done When

- [ ] All `.js` source files renamed to `.ts` / `.tsx`
- [ ] All `.spec.js` test files renamed to `.spec.ts`
- [ ] `tsc --noEmit` passes with `strict: true` on both tsconfigs
- [ ] `yarn test` (backend) still passes (2611 tests)
- [ ] `vitest run` (client) still passes (≥121/122)
- [ ] `vite build` still succeeds
- [ ] ESLint passes with TS rules enabled
