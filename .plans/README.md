# Plans

Git-native Markdown plans for multi-step work.

```
.plans/
+-- feature-name/
    +-- overview.md      # Task table, dependencies, ownership
```

**Lifecycle**: Draft → Active → Complete
**Skills**: `create-plan`, `execute-task`, `execute-plan`
**Rule**: Each task completable in one session. No file ownership overlaps.

---

## Plans

| # | Plan | Folder | Status | Description |
|---|------|--------|--------|-------------|
| 1 | [Decouple MongoDB](./decouple-mongo/overview.md) | `decouple-mongo/` | Draft | Complete the repository pattern: missing repos, `*RepositoryMemory` implementations, eliminate direct `.save()` calls and model imports from services/plugins/controllers |
| 2 | [CRA → Vite](./cra-to-vite/overview.md) | `cra-to-vite/` | Draft | Replace `react-scripts` with Vite + Vitest for React 19 compatibility and clean peer-dep tree |
| 3 | [Dependency Injection](./dependency-injection/overview.md) | `dependency-injection/` | Draft | Establish constructor injection throughout: controllers receive repos via constructor, routes become the composition root, controller specs drop `mongoServer` |
| 4 | [Use Cases](./use-cases/overview.md) | `use-cases/` | Draft | Extract business logic from controllers into dedicated use case classes; controllers become thin (validate → execute → respond) |
| 5 | [JS → TypeScript](./js-to-ts/overview.md) | `js-to-ts/` | Draft | Incremental migration of all 249 source files (backend + client) to TypeScript using `allowJs: true` throughout |
| 6 | [Remove PDV](./remove-pdv/overview.md) | `remove-pdv/` | Draft | Delete cart, payment (PagarMe), and order integration (Pedidos10) domain — ~80 source files, strip PDV fields from Licensee and Contact |
| 7 | [Local Smoke Workflow](./local-smoke-workflow/overview.md) | `local-smoke-workflow/` | Complete | Hybrid Docker + host-Vite smoke workflow with deterministic demo data and provider-shaped local doubles for pre-deploy validation |

---

## Execution Order

Plans have hard dependencies on each other. Execute in this order:

```
1. decouple-mongo       ← no prerequisites
        ↓
2. cra-to-vite          ← no prerequisites (parallel with decouple-mongo)
        ↓
3. dependency-injection ← requires decouple-mongo (needs injectable repos + RepositoryMemory)
        ↓
4. use-cases            ← requires dependency-injection (use cases must be DI-ed from day one)
        ↓
5. js-to-ts             ← requires cra-to-vite (client toolchain) + ideally after use-cases (stable structure to type)
```

Plans 1 and 2 can run **in parallel** on separate branches. Plans 3, 4, 5 are strictly sequential.

Plan 6 (remove-pdv) is **independent** — it can run in parallel with plans 1–2, but should complete **before** plans 3–5 to avoid wiring PDV controllers through DI and use-case scaffolding that will be deleted anyway.
