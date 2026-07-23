# Plan: Inbox Concept

**Status**: complete
**Created**: 2026-07-17
**Last Updated**: 2026-07-20
**Assigned Dev**: Alan Costa Facchini
**PR Strategy**: single
**Spec**: [spec.md](spec.md) — 5 user stories · 17 acceptance scenarios · 6 success criteria

## Objective

Introduce an Inbox entity so that a licensee can operate multiple WhatsApp numbers and multiple chat system instances independently. Inboxes hold the plugin configuration that previously lived only on the Licensee model; departments link to messenger inboxes for Baileys routing.

## Scope

### In Scope
- `Inbox` model — name, licensee, kind ('messenger'|'chat'), plugin config fields, inboxToken (UUID), active flag, webhookUrl virtual
- `InboxesController` — full CRUD + Baileys QR/status endpoints for messenger inboxes
- `Department.inbox` — optional FK to a messenger Inbox; DepartmentsController Baileys endpoints delegate to inbox
- `WhatsappSession` schema change — replace `department` with `inbox`; unique index becomes `{ licensee, inbox }`
- `Room.inbox`, `Message.inbox`, `Body.inbox` — nullable FK fields (pipeline carrier)
- Auth middleware (`api-routes.ts`) — parse `?inbox=<inboxToken>`, fall back to first active inbox when absent, preserve `?department=` backward compat
- `IngestMessengerMessage` + `IngestChatMessage` — thread `inboxId`
- Plugin factories (`messengers/factory.ts`, `chats/factory.ts`) — use inbox config when available, fall back to licensee config
- `BaileysSocketManager` + Baileys plugin — keyed by inbox instead of department
- Use cases `GetBaileysQrForInbox`, `GetBaileysStatusForInbox`, `SyncBaileysDirectoryForInbox`
- Migration script — Licensee plugin config → Inbox records; department WhatsappSessions → inbox WhatsappSessions
- Frontend: Inbox CRUD pages (Index, New, Edit) + services + types + i18n + navbar link
- Frontend: Department Edit form — inbox selector field
- Frontend: Chat screen — inbox picker modal when multiple local chat inboxes exist

### Out of Scope
- Chatbot config (`useChatbot`, `chatbotDefault`, etc.) — remains licensee-level
- Removing Licensee plugin fields — kept for backward compat; migration makes inboxes authoritative
- Cross-inbox message forwarding or escalation
- Inbox-level chatbot overrides
- Inbox analytics / reporting
- Sector-level permissions scoped per inbox (agent visibility is still department-scoped)

## Kill Criteria

- If `WhatsappSession` index migration causes data loss on staging, stop and restore before continuing
- If maintaining N inbox sockets breaches Heroku memory limits, stop and redesign socket pooling
- If the Baileys session shape changes in `@whiskeysockets/baileys` in a way that breaks inbox-keyed multi-session, stop and re-evaluate

## Prerequisites

> No unmerged prerequisites. `setores` plan is complete and merged.

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Data Layer | task-01, task-02 | None | Inbox model + CRUD API; schema migrations — parallel, no shared files |
| 2 | Routing & Plugin Layer | task-03, task-04 | Phase 1 | Auth middleware + message threading; plugin factories + Baileys inbox sessions — parallel |
| 3 | Data Migration | task-05 | Phase 2 | Migration script — Licensee config → Inboxes; department sessions → inbox sessions |
| 4 | Frontend | task-06, task-07 | Phase 2 | Inbox CRUD UI; department inbox selector + chat inbox picker — parallel |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-inbox-model-api | Inbox model + CRUD API + Baileys endpoints | 1 | not-started | — |
| phase-1/task-02-schema-migrations | Schema migrations (WhatsappSession, Room, Message, Body, Department) | 1 | not-started | — |
| phase-2/task-03-auth-routing | Auth middleware + IngestMessengerMessage/Chat inbox threading | 2 | not-started | phase-1/task-01-inbox-model-api, phase-1/task-02-schema-migrations |
| phase-2/task-04-plugin-factory | Plugin factories + Baileys inbox sessions + BaileysSocketManager | 2 | not-started | phase-1/task-01-inbox-model-api, phase-1/task-02-schema-migrations |
| phase-3/task-05-migration-script | MongoDB migration script — Licensee → Inbox records | 3 | not-started | phase-2/task-03-auth-routing, phase-2/task-04-plugin-factory |
| phase-4/task-06-frontend-inbox-crud | Frontend: Inbox CRUD pages + services + types + i18n | 4 | not-started | phase-2/task-03-auth-routing |
| phase-4/task-07-frontend-inbox-picker | Frontend: Department inbox selector + chat screen inbox picker | 4 | not-started | phase-2/task-03-auth-routing |

## Branch Convention

Pattern: `plan/inbox-concept/{task-path}`

Example branches:
- `plan/inbox-concept/phase-1/task-01-inbox-model-api`
- `plan/inbox-concept/phase-1/task-02-schema-migrations`
- `plan/inbox-concept/phase-2/task-03-auth-routing`
- `plan/inbox-concept/phase-2/task-04-plugin-factory`
- `plan/inbox-concept/phase-3/task-05-migration-script`
- `plan/inbox-concept/phase-4/task-06-frontend-inbox-crud`
- `plan/inbox-concept/phase-4/task-07-frontend-inbox-picker`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/app/models/Inbox.ts` | NEW — Inbox Mongoose schema |
| `src/app/repositories/inbox.ts` | NEW — InboxRepositoryDatabase + InboxRepositoryMemory |
| `src/app/controllers/InboxesController.ts` | NEW — CRUD + Baileys QR/status/sync per inbox |
| `src/app/models/Department.ts` | Modify — add `inbox` FK field |
| `src/app/models/WhatsappSession.ts` | Modify — replace `department` with `inbox`; change unique index |
| `src/app/models/Room.ts` | Modify — add `inbox` FK field |
| `src/app/models/Message.ts` | Modify — add `inbox` FK field |
| `src/app/models/Body.ts` | Modify — add `inbox` FK field |
| `src/app/routes/api-routes.ts` | Modify — parse `?inbox=<token>`, fallback logic, backward compat |
| `src/app/routes/resources-routes.ts` | Modify — add `/inboxes` routes |
| `src/app/usecases/webhooks/IngestMessengerMessage.ts` | Modify — accept + store `inboxId` |
| `src/app/usecases/licensees/GetBaileysQrForInbox.ts` | NEW — Baileys QR use case keyed by inbox |
| `src/app/usecases/licensees/GetBaileysStatusForInbox.ts` | NEW — Baileys status use case keyed by inbox |
| `src/app/usecases/licensees/SyncBaileysDirectoryForInbox.ts` | NEW — Baileys sync use case keyed by inbox |
| `src/app/plugins/messengers/factory.ts` | Modify — use inbox config when inbox provided |
| `src/app/plugins/messengers/Baileys.ts` | Modify — use inbox instead of department for sessions |
| `src/app/services/BaileysSocketManager.ts` | Modify — keyed by inbox._id |
| `src/app/runtime/dependencies.ts` | Modify — add inboxRepository |
| `src/app/repositories/testing.ts` | Modify — add inboxRepository |
| `client/src/pages/Inboxes/` | NEW — Inbox management UI |
| `client/src/services/inbox.ts` | NEW — API service functions |
| `client/src/types/inbox.ts` | NEW — IInbox TypeScript interface |
| `client/src/i18n/locales/pt.json` | Modify — add inboxes namespace |
| `client/src/i18n/locales/en.json` | Modify — add inboxes namespace |
| `client/src/pages/Chat/` | Modify — inbox picker modal |
| `client/src/pages/Departments/scenes/Edit/` | Modify — inbox selector field |

## Risks

- **WhatsappSession index migration** — replacing `{ licensee, department }` unique index with `{ licensee, inbox }` requires careful zero-downtime handling. Existing sessions with `department` set must be migrated before the old index is dropped. Mitigation: migration script runs before index change; test on staging first.
- **Baileys socket manager re-keying** — `BaileysSocketManager` currently looks up sessions by department. All call sites (`GetBaileysQrForDepartment`, `BootBaileysSocketSessions`, etc.) must be updated atomically in task-04. Mitigation: task-04 owns all of these files.
- **Backward compat for `?department=` URLs** — existing webhook integrations use `?department=` URLs. The fallback path must be preserved exactly. Mitigation: explicit tests in task-03 spec.
- **Plugin factory signature change** — factories currently accept `licensee` as first arg. Adding an optional `inbox` arg must not break existing call sites. Mitigation: inbox is optional with fallback to licensee config.

## Success Criteria

- [ ] A licensee can have multiple active messenger inboxes and multiple chat inboxes, all functioning independently
- [ ] Webhook URLs with `?inbox=<inboxToken>` route to the correct inbox's plugin config
- [ ] Old webhook URLs (`?token=` only or with `?department=`) continue to work
- [ ] Migration script creates correct Inbox records for all licensees; Baileys department sessions migrate to inbox sessions
- [ ] Chat screen shows inbox picker when multiple local chat inboxes exist
- [ ] All existing tests pass; `npx eslint .` returns no new errors

## References

- **GitHub Issue**: #2977
- **Related Plans**: [setores](../setores/overview.md), [setores-webhook-providers](../setores-webhook-providers/overview.md)
- **JIRA Epic**: N/A
- **Rock Alignment**: N/A
