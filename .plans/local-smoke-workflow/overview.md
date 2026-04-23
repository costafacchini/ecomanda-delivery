# Plan: Local Smoke Workflow

**Created**: 2026-04-22
**Status**: Complete
**Branch**: feature/local-smoke-workflow

## Objective

Create a repeatable local smoke workflow that lets us boot the full app stack, load
realistic demo data, and verify the critical flows before production deploys without
adding browser E2E tests or requiring real third-party credentials.

The target outcome is a short, documented sequence of scripts for:
- bringing up local infrastructure
- seeding complete demo data
- starting backend, worker, and frontend in a smoke-safe profile
- running a scripted smoke check plus a short manual checklist

## Current Findings

- There is no existing seed/reset or smoke orchestration workflow in the repo today.
- Existing Fishery factories already cover core entities (`User`, `Licensee`, `Contact`,
  `Message`, `Cart`, `Trigger`, `Template`, `Backgroundjob`, `Order`), so they are a
  good base for realistic demo data.
- The frontend proxy target is env-driven and intentionally falls back to `5001`; the
  smoke workflow should override it explicitly instead of treating that default as a bug.
- The most important production flow is the queue-backed message bridge: webhook payloads
  enter through `/api/v1/chat/message` and `/api/v1/messenger/message`, controllers store
  raw `Body` documents, worker jobs transform them into `Message` records, and follow-up
  jobs fan out to chat, messenger, or chatbot plugins.
- The authenticated backoffice flow is comparatively small: `POST /login` issues a JWT
  and the frontend immediately validates it through `GET /resources/users/:email`.
- Queue-driven flows depend on Redis workers and several third-party integrations, so the
  smoke workflow needs a safe local mode that does not hit live providers.
- The first smoke provider pair is locked to `chatwoot + ycloud` because it matches the
  current operational design more closely than the older Rocket.Chat or Dialog paths.
- The existing Fishery factories are useful as references, but the standalone smoke
  scripts cannot import them directly under plain Node because those modules still use
  extensionless local imports; the smoke seed builders mirror the same shapes locally.
- The smoke app must always listen on container port `5000`; only the host-facing smoke
  port should vary, otherwise Docker publishes a port that has no listener behind it.
- The smoke topology must explicitly pin `ENABLE_*` and `DONT_SEND_*` worker flags
  because the repo root `.env` can disable messenger dispatch in normal development mode.

## Core Functionality To Prove

- Admin access works end to end: frontend loads, `POST /login` succeeds, and an
  authenticated `/resources` request returns the logged user.
- Messenger inbound text webhook works end to end: valid `apiToken` request stores a raw
  body, the `messenger-message` worker creates or updates the contact, creates a
  `Message`, and emits a follow-up action toward chat or chatbot.
- Chat outbound agent message webhook works end to end: valid `apiToken` request stores a
  raw body, the `chat-message` worker creates a `Message`, and emits a follow-up action
  toward the messenger side.
- Outbound dispatcher jobs resolve plugins from licensee config (`chatDefault`,
  `whatsappDefault`, `chatbotDefault`) and attempt delivery against local doubles instead
  of real providers.
- Trigger, template, cart, and order branches are important but secondary; the first smoke
  workflow should seed examples for manual inspection while automating only the text-path
  happy flows above.

## Acceptance Criteria

- One documented command or short command sequence prepares local infra and demo data from
  a clean checkout.
- One documented command starts the backend, worker, frontend, and required local
  dependencies in a smoke profile.
- One scripted smoke command validates login, resource APIs, frontend availability, and
  both sides of the primary webhook bridge (`messenger -> worker -> chat action` and
  `chat -> worker -> messenger action`) using local doubles.
- No new browser automation or E2E test framework is introduced.
- No real third-party chat, chatbot, WhatsApp, payment, or Pedidos10 side effects are
  triggered during the smoke run.

## Tasks

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 1 | Define the smoke runtime contract for the current mainline topology: choose canonical local ports, add a dedicated smoke env profile, and lock the first smoke provider pair to `chatwoot + ycloud` | Complete | `client/vite.config.js`, `.env.smoke.example`, `src/scripts/smoke/env.mjs` | — |
| 2 | Build idempotent reset/seed scripts that create complete demo data for smoke usage: admin user, demo licensee, API token, contact, room, messages, and representative trigger/template/cart records derived from factory-equivalent local builders | Complete | `src/scripts/smoke/reset.mjs`, `src/scripts/smoke/seed.mjs`, `src/scripts/smoke/data/*.mjs`, `src/scripts/smoke/payloads/*.json` | 1 |
| 3 | Add hybrid smoke orchestration so Docker runs infra, app, worker, and fake providers while the Vite frontend stays on the host for manual inspection | Complete | `docker-compose.smoke.yml`, `Dockerfile.smoke`, `.dockerignore`, `package.json`, `src/scripts/smoke/start.mjs`, `src/scripts/smoke/stop.mjs`, `src/scripts/smoke/env.mjs` | 1, 2 |
| 4 | Add safe local integration doubles or capture endpoints so smoke flows can exercise the outbound plugin paths without talking to real Chatwoot, WhatsApp, chatbot, payment, or Pedidos10 providers | Complete | `src/scripts/smoke/mock-integrations.mjs`, `src/scripts/smoke/mock-state.mjs`, `src/scripts/smoke/routes/*.mjs` | 1, 2 |
| 5 | Add a non-test smoke verification command plus operator documentation that proves login, resources, and both webhook bridge directions against the seeded smoke topology | Complete | `src/scripts/smoke/check.mjs`, `docs/kb/features/local-smoke-workflow.md`, `docs/kb/README.md` | 2, 3, 4 |

## File Ownership

- Task 1 owns runtime topology and smoke-profile config files only.
- Task 2 owns demo data generation and payload fixture files only.
- Task 3 owns the smoke image, compose overlay, package scripts, and long-running process wrappers only.
- Task 4 owns local mock integration helpers only.
- Task 5 owns smoke verification and documentation only.

## Risks

- Third-party providers are not suitable for routine local smoke runs; the workflow must
  use local doubles, capture endpoints, or explicit no-send modes.
- Demo data can drift from schema changes over time; seeds should derive from factories or
  shared builders instead of hardcoded raw documents.
- Queue-driven flows are asynchronous; the smoke verifier must poll for observable
  outcomes with explicit timeouts instead of assuming immediate completion.
- Host and container networking differ; the smoke topology must define proxy and service
  URLs explicitly so the host frontend can reach the containerized app and the
  containerized app can reach the fake providers correctly.
- The webhook plugins cover many branches; if the first smoke pass tries to automate
  triggers, templates, carts, and file/media handling all at once, the workflow will
  become brittle and expensive to maintain.
- Any smoke workflow that diverges too far from production topology will give false
  confidence; the plan should minimize special-case behavior to what is necessary for safe
  local execution.

## Done When

- [x] Local smoke workflow boots from a clean checkout with documented commands
- [x] Complete demo data is created automatically for admin, resources, and at least one integration flow
- [x] Smoke verification covers login, resource API access, frontend availability, and both primary worker-processed bridge directions
- [x] No browser E2E test framework was added
- [x] Documentation is added to the KB and the KB index is updated

## Current Checkpoint

- Tasks 1 through 5 are complete and the workflow is verified end to end.
- Static verification passed: ESLint, script syntax checks, `git diff --check`, and `docker compose ... config`.
- Runtime verification passed on 2026-04-23 with `yarn smoke:start` and `yarn smoke:check`; the verifier confirmed frontend availability, login, authenticated resources access, and both webhook bridge directions against the local Chatwoot and YCloud doubles.
- The host Vite frontend remains available at `http://127.0.0.1:5173` for manual inspection during smoke runs, but manual observation is no longer a blocker for plan completion.
