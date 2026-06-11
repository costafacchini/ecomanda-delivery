# Plan: Setores — Webhook Providers

**Status**: complete
**Created**: 2026-06-04
**Last Updated**: 2026-06-11
**Estimated Demo Date**: TBD — depends on `setores` plan completion
**Assigned Dev**: Alan Costa Facchini
**Assigned QA**: unassigned

## Objective

Extend sector (Setor) support to non-Baileys messenger plugins (utalk, dialog, ycloud, pabbly) by embedding a sector token in the inbound webhook URL, so the system can identify which sector a message belongs to and route it correctly through the Body → Message → Room pipeline.

## Scope

### In Scope

- `setorToken` field on `Setor` — auto-generated UUID (same pattern as `licensee.apiToken`), unique, used as the sector identifier in webhook URLs
- `webhookUrl` virtual on `Setor` — computed from `licensee.apiToken` + `setorToken`; exposed in `SetoresController` responses so admins can copy it into provider dashboards
- Auth middleware (`api-routes.ts`) — reads optional `?setor={setorToken}` query param, looks up the Setor, and attaches `req.setor` to the request
- `MessengersController` — forwards `req.setor?._id` as `setorId` to `IngestMessengerMessage`
- `IngestMessengerMessage` — accepts `setorId` and persists it on the `Body` document (the async job bridge)
- `transformMessengerBody` (`MessengerMessage.ts`) — reads `body.setor` and stamps it onto each created `Message`
- The rest of the pipeline (`LocalChat.sendMessage()` → `Room.create()`) already handles `setor` from the `setores` plan

### Out of Scope

- Baileys — sector routing for Baileys is handled by the `setores` plan via `BaileysSocketManager` re-keying
- Per-sector chatbot configuration — uses licensee chatbot settings
- Rotating or revoking sector tokens — v1 only; token is fixed at creation
- Sector support for chat plugins (rocketchat, crisp, chatwoot) — those receive events from their own platforms; sector awareness there is a separate concern
- Multi-sector webhook fan-out — one sector maps to one webhook URL; a message arriving without `?setor=` is treated as belonging to no sector (licensee-level)

## Kill Criteria

- If the `setores` plan is not merged to `main` before execution starts, stop — the `Setor` model, `Body.setor`, `Message.setor`, and `Room.setor` fields are all prerequisites
- If any messenger provider (utalk, dialog, ycloud, pabbly) does not support custom webhook URLs with query parameters, that provider cannot use sector routing — document the limitation and continue with the others

## Prerequisites

> **This plan cannot be executed until `setores` is fully merged to `main`.**
>
> Required from `setores`:
> - `Setor` model and `SetorRepositoryDatabase` (task-01)
> - `Body.setor`, `Message.setor`, `Room.setor` fields (task-02)
> - `setorRepository` wired in `dependencies.ts` (task-01)
> - `LocalChat.sendMessage()` reading `message.setor` → `Room.create()` (task-04)

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Token & URL | task-01 | None | Add `setorToken` to Setor model and expose `webhookUrl` virtual in the controller |
| 2 | Inbound Pipeline | task-02, task-03 | Phase 1 | Auth middleware reads `?setor=` param; ingest pipeline threads `setorId` from controller to Body to Message — parallel, no shared files |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-setor-token | Setor token field + webhook URL virtual | 1 | not-started | — |
| phase-2/task-02-auth-middleware | Auth middleware: resolve sector from query param | 2 | not-started | phase-1/task-01-setor-token |
| phase-2/task-03-ingest-pipeline | Ingest pipeline: thread setorId from controller to Message | 2 | not-started | phase-1/task-01-setor-token |

## Branch Convention

Pattern: `plan/setores-webhook-providers/{task-path}`

Example branches:
- `plan/setores-webhook-providers/phase-1/task-01-setor-token`
- `plan/setores-webhook-providers/phase-2/task-02-auth-middleware`
- `plan/setores-webhook-providers/phase-2/task-03-ingest-pipeline`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/app/models/Setor.ts` | Add `setorToken` field and `webhookUrl` virtual |
| `src/app/models/Setor.spec.ts` | Add token generation and virtual tests |
| `src/app/controllers/SetoresController.ts` | Populate `licensee` in show/index so `webhookUrl` virtual resolves |
| `src/app/controllers/SetoresController.spec.ts` | Add webhook URL assertion |
| `src/app/routes/api-routes.ts` | Auth middleware — read `?setor=` param, attach `req.setor` |
| `src/app/controllers/MessengersController.ts` | Forward `req.setor?._id` as `setorId` |
| `src/app/controllers/MessengersController.spec.ts` | Add sector forwarding test |
| `src/app/usecases/webhooks/IngestMessengerMessage.ts` | Accept + persist `setorId` on Body |
| `src/app/usecases/webhooks/IngestMessengerMessage.spec.ts` | Add setorId test |
| `src/app/services/MessengerMessage.ts` | Read `body.setor`, stamp onto each Message |
| `src/app/services/MessengerMessage.spec.ts` | Add setor propagation test |

## Risks

- **Provider query param support** — utalk, dialog, ycloud, and pabbly must accept a webhook URL with query parameters. Most do, but if a provider URL-encodes or strips query params, sector routing silently falls back to licensee-level. Mitigation: test each provider's webhook configuration in staging before deploying.
- **Token collision** — `setorToken` is a UUID v4; collision probability is negligible but the unique index on `Setor.setorToken` enforces correctness at the DB level.
- **Missing `?setor=` on existing webhooks** — providers already configured without a sector token will continue to work exactly as before (`req.setor` is null, sector routing is skipped). Zero breaking change for existing integrations.

## Success Criteria

- [ ] A `Setor` is created with a unique `setorToken` auto-generated on save
- [ ] `SetoresController.show` response includes `webhookUrl` with the correct `?token=&setor=` format
- [ ] A webhook POST to `/api/v1/messenger/message?token={licenseeToken}&setor={setorToken}` attaches the correct Setor to the request
- [ ] A webhook POST without `?setor=` continues to work as before (no regression)
- [ ] A Body created from a sector-scoped webhook has `setor` populated
- [ ] A Message created from that Body has `setor` populated
- [ ] A Room created by `LocalChat.sendMessage()` from that Message has `setor` populated
- [ ] All unit tests pass: `npx jest`
- [ ] `npx eslint .` produces no new errors

## References

- **JIRA Epic**: N/A
- **Related Plans**: [Setores](../setores/overview.md) — prerequisite; provides Setor model and pipeline setor fields
- **Rock Alignment**: N/A
