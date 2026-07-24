# Plan: Ecomanda Fly.io Deploy

**Status**: not-started
**Created**: 2026-07-24
**Last Updated**: 2026-07-24
**Assigned Dev**: Alan Costa Facchini
**PR Strategy**: single
**Spec**: [spec.md](spec.md) — 2 user stories · 7 acceptance scenarios · 5 success criteria

## Objective

Deploy ecomanda on Fly.io as a single 1 GB VM running both server and worker, replacing Heroku. No ticketmaker code changes — only the `ecomanda_base_url` secret is updated after deploy.

## Scope

### In Scope
- Combined start script (server + worker in one container)
- Simplified Dockerfile that skips client/widget builds
- `fly.toml` configuration for ecomanda
- Fly.io secrets setup and deploy
- ticketmaker `ECOMANDA_BASE_URL` secret cutover
- Smoke test verifying a real WhatsApp message is sent

### Out of Scope
- Inbound WhatsApp message processing — `ENABLE_BAILEYS_SOCKET=false`; not needed by ticketmaker
- React client / widget hosting — ticketmaker only uses the REST API
- QR code re-pairing — session persists in shared MongoDB Atlas
- Any new features or code changes in ticketmaker beyond the secret update

## Kill Criteria
- If MongoDB Atlas free tier restricts connections from Fly.io IPs in a way that cannot be resolved via Atlas Network Access settings
- If the existing Baileys session in MongoDB is corrupt or expired and QR re-pairing proves impractical before Heroku shuts down

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Ecomanda Prep | task-01, task-02 | None | Add combined start script and Fly.io config to ecomanda repo |
| 2 | Deploy & Verify | task-03 | Phase 1 | Launch ecomanda on Fly.io, set secrets, verify health + message send |
| 3 | Ticketmaker Cutover | task-04 | Phase 2 | Update ticketmaker secret and run smoke test |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-combined-start | Add combined start script | 1 | not-started | — |
| phase-1/task-02-flyio-config | Create Fly.io configuration | 1 | not-started | — |
| phase-2/task-03-deploy-verify | Deploy to Fly.io and verify | 2 | not-started | phase-1/task-01, phase-1/task-02 |
| phase-3/task-04-ticketmaker-cutover | Update ticketmaker secret + smoke test | 3 | not-started | phase-2/task-03 |

## Branch Convention

Pattern: `plan/ecomanda-flyio/{task-path}`

Example branches:
- `plan/ecomanda-flyio/phase-1/task-01-combined-start`
- `plan/ecomanda-flyio/phase-1/task-02-flyio-config`

> **Note**: Tasks 01 and 02 modify `ecomanda-delivery` repo. Tasks 03 and 04 use Fly.io CLI and modify `ticketmaker` repo respectively. Branches are tracked in ticketmaker but execution touches both repos.

Base branch: `main` (ticketmaker) / `main` (ecomanda-delivery)

## Key Files

| File/Directory | Repo | Relevance |
|----------------|------|-----------|
| `start-combined.sh` | ecomanda-delivery | New entrypoint that forks worker and runs server |
| `package.json` | ecomanda-delivery | Add `start:fly` and `build:fly` scripts |
| `Dockerfile` | ecomanda-delivery | Modify to use `build:fly` and `start:fly` |
| `fly.toml` | ecomanda-delivery | New — Fly.io app config (VM size, env, health check) |
| `server.ts` | ecomanda-delivery | Entry point for HTTP server (read-only reference) |
| `worker.ts` | ecomanda-delivery | Entry point for BullMQ worker (read-only reference) |
| `app/services/messaging/providers/ecomanda.rb` | ticketmaker | References `ecomanda_base_url` — no code change, secret only |

## Risks

- **Baileys session expiry** — If the MongoDB session was last paired on Heroku and is near expiry, the first send may fail with 401 (logged out). Mitigation: verify session status via `/resources/baileys-status` endpoint before cutover.
- **MongoDB Atlas Network Access** — Atlas may block Fly.io egress IPs. Mitigation: set Atlas Network Access to allow all (0.0.0.0/0) or add Fly.io's shared IP ranges.
- **Memory pressure** — On-demand Baileys socket spikes RAM briefly per send. 1 GB should be sufficient given Heroku peak of ~442 MB with persistent socket. Mitigation: monitor `fly metrics` after first sends.
- **Redis connection limits** — Free tier Redis may have connection limits. Mitigation: verify BullMQ connects successfully after deploy.

## Success Criteria

- [ ] SC-001: `fly status` shows ecomanda running (1 machine)
- [ ] SC-002: `POST /resources/messages` returns 2xx on the Fly.io URL
- [ ] SC-003: A real WhatsApp message is received during smoke test
- [ ] SC-004: No Fly.io volume is provisioned
- [ ] SC-005: ticketmaker messaging tests pass after secret update

## References

- **JIRA Epic**: N/A
- **Weekly Plan Brief**: N/A
- **Related Plans**: None
- **Rock Alignment**: N/A
