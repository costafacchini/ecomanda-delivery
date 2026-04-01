# Job Queue System — BullMQ & Trafficlight

**Last Updated**: 2026-04-01
**Context**: Read when working on async job processing, message ordering, worker logic, or environment feature flags.

---

## Overview

All async work flows through BullMQ queues (`src/config/queue.js`). Jobs are feature-flagged via environment variables (`src/app/jobs/index.js`).

---

## Trafficlight Locking

**Purpose**: Prevent message reordering when webhooks arrive concurrently for the same contact.

**Implementation**:
- MongoDB unique index on `{key, token}` with TTL
- Lock keys: `contact:{id}` or `licensee:{id}`
- See `src/app/helpers/Trafficlight.js`

**Behavior**:
- Worker acquires lock before processing a job
- Jobs retry with exponential backoff if lock acquisition fails
- Lock is released after job completion (or TTL expiry as safety net)

**Tuning**: Adjust `JOB_LOCK_TTL_MS` env var (default 120s) if jobs are timing out.

---

## Job Chaining

Jobs can return arrays of follow-up jobs. This chains workflows without blocking the initial webhook response. Example: receive message → route to chat → send reply.

---

## Environment Feature Flags

Jobs are conditionally loaded based on env vars:

| Env Var | Effect |
|---------|--------|
| `INTEGRATE_PEDIDOS10=true` | Enable Pedidos10 order sync |
| `INTEGRATE_PAGARME=true` | Enable payment processing |
| `ENABLE_CHATBOTS=true` | Enable chatbot routing |
| `ENABLE_RESET_JOBS=true` | Enable scheduled cleanup tasks |
| `DONT_SEND_MESSAGE_TO_CHAT=true` | Disable outbound chat messages (useful in testing) |

---

## Monitoring

Bull Board UI is available at `/queue` (requires the server to be running).
Local: `http://localhost:5000/queue`

---

## Worker Scaling (Heroku)

The `scaler` Procfile process dynamically adjusts the number of `worker` dynos based on queue depth. Up to 15 `worker` processes run in parallel for job concurrency.
