# Plans

Git-native Markdown plans for multi-step work.

```
.plans/
+-- plan-slug/
    +-- overview.md              # Objective, scope, phase/task summary, success criteria
    +-- phase-N/
        +-- task-NN-slug.md      # Full task spec
        +-- task-NN-slug/
            +-- status.md        # Live status tracking
```

**Lifecycle**: not-started → in-progress → complete
**Skills**: `create-plan`, `execute-task`, `execute-plan`
**Rule**: Each task completable in one session. No file ownership overlaps.

---

## Active Plans

| # | Plan | Folder | Status | Description |
|---|------|--------|--------|-------------|
| 1 | [JS → TypeScript](./js-to-ts/overview.md) | `js-to-ts/` | not-started | Incremental migration of all source files (backend + client) to TypeScript using `allowJs: true` throughout |
| 2 | [Remove PDV](./remove-pdv/overview.md) | `remove-pdv/` | not-started | Delete cart, payment (PagarMe), and order integration (Pedidos10) domain — strip PDV fields from Licensee and Contact |

---

## Completed Plans

| # | Plan | Folder | Completed | Description |
|---|------|--------|-----------|-------------|
| 1 | [Use Cases](./use-cases/overview.md) | `use-cases/` | 2026-04-29 | Extract business logic from controllers into dedicated use case classes; controllers become thin (validate → execute → respond) |

---

## Execution Order

```
1. use-cases     ← requires dependency-injection (complete)
        ↓
2. js-to-ts      ← ideally after use-cases (stable structure to type)
```

Plan 3 (remove-pdv) is **independent** — can run in parallel with use-cases, but should complete before js-to-ts to avoid typing code that will be deleted.
