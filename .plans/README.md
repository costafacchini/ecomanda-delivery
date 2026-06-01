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
| 1 | [JS → TypeScript](./js-to-ts/overview.md) | `js-to-ts/` | complete | Incremental migration of all source files (backend + client) to TypeScript using `allowJs: true` throughout |
| 2 | [Remove PDV](./remove-pdv/overview.md) | `remove-pdv/` | not-started | Delete cart, payment (PagarMe), and order integration (Pedidos10) domain — strip PDV fields from Licensee and Contact |
| 3 | [Security Hardening](./security-hardening/overview.md) | `security-hardening/` | not-started | Fix 10 security issues from OWASP audit: Helmet, CORS, rate limiting, Bull Board auth, error leakage, JWT fix, RBAC, logging PII, API token header, v1 input validation |
| 4 | [MongoDB → PostgreSQL](./mongo-to-postgres/overview.md) | `mongo-to-postgres/` | not-started | Migrate all persistent data from MongoDB/Mongoose to PostgreSQL/Prisma using dual-write strategy; prerequisite: remove-pdv complete |
| 5 | [Baileys Socket Monitor](./baileys-socket-monitor/overview.md) | `baileys-socket-monitor/` | not-started | Replace webhook-only inbound flow with a persistent Baileys socket per licensee; captures messages.upsert and messages.update natively |
| 6 | [Local Chat Infrastructure](./local-chat-infra/overview.md) | `local-chat-infra/` | not-started | User role system (agent/supervisor/admin/super), LocalChat plugin, super licensee flow, route authorization — prerequisite for setores |
| 7 | [Setores](./setores/overview.md) | `setores/` | not-started | Multiple WhatsApp numbers per licensee via sectors; sector-scoped message routing and agent access filtering |
| 8 | [Backend Type Narrowing](./type-backend/overview.md) | `type-backend/` | not-started | Replace `any` with interfaces across models, repositories, use cases, controllers, and plugins — 3 phases, 11 tasks |
| 9 | [Client Type Narrowing](./type-client/overview.md) | `type-client/` | not-started | Replace `any` with interfaces across React services, contexts, pages, and components — 2 phases, 6 tasks |

---

## Completed Plans

| # | Plan | Folder | Completed | Description |
|---|------|--------|-----------|-------------|
| 1 | [Use Cases](./use-cases/overview.md) | `use-cases/` | 2026-04-29 | Extract business logic from controllers into dedicated use case classes; controllers become thin (validate → execute → respond) |
| 7 | [JS → TypeScript](./js-to-ts/overview.md) | `js-to-ts/` | 2026-05-31 | Incremental migration of all source files (backend + client) to TypeScript; strict: true; @typescript-eslint/recommended |
| 2 | [Baileys WhatsApp Plugin](./baileys-plugin/overview.md) | `baileys-plugin/` | 2026-05-05 | Add Baileys-based WhatsApp messenger plugin with session persistence (WhatsappSession model), following the Dialog plugin architecture |
| 3 | [Licensee Form Wizard](./licensee-form-wizard/overview.md) | `licensee-form-wizard/` | 2026-05-07 | Split the licensee form into Bootstrap 5 Nav Tabs with panels shown/hidden based on question checkboxes; removed per-licensee AWS fields |
| 4 | [Licensee Create Wizard](./licensee-wizard/overview.md) | `licensee-wizard/` | 2026-05-07 | Multi-step wizard for New Licensee (7 steps, Yes/No gates); removed question checkboxes from Edit form |
| 5 | [Dashboard Widgets](./dashboard-widgets/overview.md) | `dashboard-widgets/` | 2026-05-07 | Role-aware dashboard: 5 super cards + 3 licensee cards, per-card REST endpoints, Redis caching, resend modal |
| 6 | [Baileys Group Messaging & Directory Sync](./baileys-groups-directory/overview.md) | `baileys-groups-directory/` | 2026-05-16 | Extend the existing Baileys plugin to import WhatsApp groups into Contacts and send outbound messages to group JIDs |

---

## Execution Order

```
1. use-cases     ← requires dependency-injection (complete)
        ↓
2. js-to-ts      ← ideally after use-cases (stable structure to type)
```

Plan 3 (remove-pdv) is **independent** — can run in parallel with use-cases, but should complete before js-to-ts to avoid typing code that will be deleted.
