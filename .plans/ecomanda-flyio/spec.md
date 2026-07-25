# Spec: Ecomanda Fly.io Deploy

**Last Updated**: 2026-07-24
**Plan**: ecomanda-flyio

---

## User Stories

### Story 1 (P1) — WhatsApp messages delivered via Fly.io-hosted ecomanda

**As a** ticketmaker operator,
**I want** WhatsApp messages to be sent through an ecomanda instance hosted on Fly.io,
**So that** the service keeps working after Heroku is shut down — with zero changes in the ticketmaker codebase.

#### Acceptance Scenarios

**Scenario 1.1 — Server starts and connects to MongoDB**
- Given: ecomanda is deployed on Fly.io with valid `MONGODB_URI` and `REDIS_URL` secrets
- When: the Fly.io VM boots
- Then: the server logs "connected to MongoDB", no crash on startup

**Scenario 1.2 — POST /resources/messages returns success**
- Given: ecomanda is running on Fly.io and a licensee exists in MongoDB with a valid `apiToken`
- When: ticketmaker sends `POST https://<ecomanda-flyio-url>/resources/messages?token=<apiToken>` with a valid JSON payload
- Then: the response is HTTP 200/201 with a message ID in the body

**Scenario 1.3 — Baileys session reused, no QR re-pairing needed**
- Given: the MongoDB Atlas instance contains a persisted Baileys session (`WhatsappSession` document)
- When: the worker processes a send-message job
- Then: the message is sent without prompting for a new QR code

**Scenario 1.4 — Message arrives on WhatsApp**
- Given: the Fly.io ecomanda is healthy and a send job is enqueued
- When: the BullMQ worker processes the job
- Then: the target phone/group receives the WhatsApp message within 30 seconds

---

### Story 2 (P2) — Server and worker run in a single 1 GB Fly.io VM

**As a** developer,
**I want** ecomanda's server and worker to run together in one VM,
**So that** monthly Fly.io cost stays under $6.

#### Acceptance Scenarios

**Scenario 2.1 — Combined start boots both processes**
- Given: the combined start script is executed
- When: the VM starts
- Then: both the Express HTTP server (port 5000) and the BullMQ worker are active in the same OS process group

**Scenario 2.2 — ENABLE_BAILEYS_SOCKET=false suppresses persistent socket**
- Given: `ENABLE_BAILEYS_SOCKET=false` in Fly.io secrets
- When: the server boots
- Then: no persistent Baileys WebSocket is opened; the worker opens one on-demand per send job

**Scenario 2.3 — Client/widget build is skipped**
- Given: the Fly.io Dockerfile runs the build step
- When: the image is built
- Then: only the TypeScript backend is compiled; `client/` and `widget/` directories are not built

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-001 | A combined entrypoint launches `dist/server.js` and `dist/worker.js` in the same container |
| FR-002 | The Dockerfile (or build script) skips `client/` and `widget/` yarn builds |
| FR-003 | `ENABLE_BAILEYS_SOCKET=false` is set in Fly.io secrets |
| FR-004 | `MONGODB_URI` and `REDIS_URL` are provided via Fly.io secrets (no volumes provisioned) |
| FR-005 | The Fly.io app is configured with `memory = 1024` (1 GB), `shared-cpu-1x` |
| FR-006 | ticketmaker's `ECOMANDA_BASE_URL` Fly.io secret is updated to the new ecomanda URL |
| FR-007 | The `/resources/messages` endpoint accepts requests authenticated via `?token=<apiToken>` |

---

## Success Criteria

| ID | Criterion |
|----|-----------|
| SC-001 | `fly status` shows the ecomanda app as `running` with 1 machine |
| SC-002 | `POST /resources/messages` returns 2xx on the new Fly.io URL with a valid token |
| SC-003 | A real WhatsApp message is received during smoke test (Story 1, Scenario 1.4) |
| SC-004 | No Fly.io volume is provisioned — sessions persist in MongoDB Atlas |
| SC-005 | ticketmaker's existing messaging tests still pass after the URL change |

---

## Assumptions

- MongoDB Atlas free tier retains the existing `WhatsappSession` document — no QR re-pairing needed.
- Redis free tier (external) is already provisioned and accessible; its `REDIS_URL` is known.
- The Heroku ecomanda instance remains running until SC-003 is verified on Fly.io.
- The ecomanda app name on Fly.io will be `ecomanda-delivery` (or similar — confirm before `fly launch`).
- No inbound WhatsApp messages need to be processed — `ENABLE_BAILEYS_SOCKET=false` is acceptable.
