# Plan: Setores

**Status**: not-started
**Created**: 2026-05-29
**Last Updated**: 2026-05-29
**Estimated Demo Date**: TBD — depends on local-chat-infra completion
**Assigned Dev**: Alan Costa Facchini
**Assigned QA**: unassigned

## Objective

Add a Setor (department) entity to the platform, allowing a licensee to have multiple WhatsApp numbers (one per sector), route incoming messages to the correct sector's agents, and control visibility so agents only see conversations from their own sector.

## Scope

### In Scope
- `Setor` model — name, licensee, users (min 1, required), active flag
- `Licensee.useSetores` flag — enables/disables the sector feature per licensee
- `WhatsappSession` schema change — add `setor` field (nullable); change unique index from `{ licensee }` to `{ licensee, setor }`
- `Room` schema change — add `setor` field (nullable)
- CRUD API for sectors: `POST/GET/PUT/DELETE /resources/setores`
- `BaileysSocketManager` re-keyed by `WhatsappSession._id` to support multiple sessions per licensee
- Baileys QR/status/sync endpoints scoped to sectors: `/resources/setores/:id/baileys-qr`, etc.
- Message routing — socket events from a sector's number attach `setor` to the Room
- Agent access filtering — agents (and supervisors) only see rooms/messages from their sector(s)
- Frontend: Setor CRUD (create, list, edit, delete) with user multi-select
- Frontend: Baileys connect flow per sector (QR, status, sync)
- Frontend: Inbox sector filtering — agents see only their sector's conversations

### Out of Scope
- Cross-sector message forwarding or escalation
- Sector-level chatbot configuration — uses licensee chatbot settings
- Group WhatsApp numbers per sector (one Baileys session per sector max)
- Sector analytics / reporting
- Automatic agent assignment within a sector (manual pickup only, for now)

## Kill Criteria

- If `WhatsappSession` migration causes data loss in production, stop and restore backup before continuing
- If maintaining N sector sockets (in addition to main) breaches Heroku memory limits, stop and redesign socket pooling
- If Baileys `@whiskeysockets/baileys` changes the session shape in a way that breaks multi-session keying, stop and re-evaluate

## Prerequisites

> **This plan cannot be executed until the following plans are merged to `main`:**
> - `baileys-socket-monitor` — provides `BaileysSocketManager` and `StartBaileysSocket`
> - `local-chat-infra` — provides agent roles, Room model with `agent` field, LocalChat plugin

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Data Layer | task-01, task-02 | None | Setor model + API; schema migrations — parallel, no shared files |
| 2 | Socket & Routing | task-03, task-04 | Phase 1 | Multi-session socket manager + message routing by sector — parallel |
| 3 | Frontend | task-05, task-06 | Phase 2 | Sector CRUD UI + inbox filtering — parallel |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-setor-model-api | Setor model + CRUD API | 1 | not-started | — |
| phase-1/task-02-schema-migrations | Schema migrations (WhatsappSession, Room, Licensee) | 1 | not-started | — |
| phase-2/task-03-multi-session-baileys | Multi-session BaileysSocketManager + sector endpoints | 2 | not-started | phase-1/task-01-setor-model-api, phase-1/task-02-schema-migrations |
| phase-2/task-04-message-routing | Message routing + agent access filtering | 2 | not-started | phase-1/task-01-setor-model-api, phase-1/task-02-schema-migrations |
| phase-3/task-05-frontend-setor-crud | Frontend: Setor CRUD + Baileys connect | 3 | not-started | phase-2/task-03-multi-session-baileys |
| phase-3/task-06-frontend-inbox-filtering | Frontend: Inbox sector filtering | 3 | not-started | phase-2/task-04-message-routing |

## Branch Convention

Pattern: `plan/setores/{task-path}`

Example branches:
- `plan/setores/phase-1/task-01-setor-model-api`
- `plan/setores/phase-1/task-02-schema-migrations`
- `plan/setores/phase-2/task-03-multi-session-baileys`
- `plan/setores/phase-2/task-04-message-routing`
- `plan/setores/phase-3/task-05-frontend-setor-crud`
- `plan/setores/phase-3/task-06-frontend-inbox-filtering`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/app/models/Setor.ts` | NEW — sector model |
| `src/app/repositories/setor.ts` | NEW — sector repository |
| `src/app/controllers/SetoresController.ts` | NEW — CRUD + Baileys methods |
| `src/app/models/WhatsappSession.ts` | Modify — add `setor` field, change unique index |
| `src/app/models/Room.ts` | Modify — add `setor` field |
| `src/app/models/Licensee.ts` | Modify — add `useSetores` flag |
| `src/app/services/BaileysSocketManager.ts` | Modify — re-key by `session._id` |
| `src/app/usecases/licensees/StartBaileysSocket.ts` | Modify — accept optional `setor` param |
| `src/app/routes/resources-routes.ts` | Modify — add sector routes |
| `src/app/runtime/dependencies.ts` | Modify — add `setorRepository` |
| `client/src/pages/Setores/` | NEW — sector management UI |
| `client/src/pages/Messages/` | Modify — sector filtering for agents |

## Risks

- **WhatsappSession index migration** — dropping the unique index and recreating it as compound requires a maintenance window or careful zero-downtime migration. An existing session with `setor: null` must not conflict with future sector sessions on the same licensee. Mitigation: use a sparse compound index; test migration in staging first.
- **Socket manager re-keying** — `BaileysSocketManager` currently keyed by `licenseeId`. Changing to `session._id` affects `StartBaileysSocket`, `BootBaileysSocketSessions`, and `GetBaileysQr`. All three must be updated atomically. Mitigation: task-03 owns all of these.
- **Agent access control** — if access filtering is incomplete, agents from sector A could see sector B messages. Mitigation: filtering applied at the repository query level, not just the UI.

## Success Criteria

- [ ] A sector can be created with at least one user — creation fails without users
- [ ] A sector can have a Baileys number connected independently from the licensee's main number
- [ ] Messages arriving on the sector's number create a Room with `setor` populated
- [ ] Agents assigned to a sector only see rooms/messages for that sector
- [ ] Messages arriving on the licensee's main number (no sector) are visible to all agents
- [ ] `Licensee.useSetores = false` hides all sector functionality for that licensee
- [ ] Existing licensees without sectors are unaffected
- [ ] `BaileysSocketManager` supports concurrent sockets for main + all active sector sessions
- [ ] All unit tests pass: `npx jest`
- [ ] `npx eslint .` produces no new errors

## References

- **JIRA Epic**: N/A
- **Related Plans**: [Baileys Socket Monitor](../baileys-socket-monitor/overview.md), local-chat-infra (not yet created)
- **Rock Alignment**: N/A
