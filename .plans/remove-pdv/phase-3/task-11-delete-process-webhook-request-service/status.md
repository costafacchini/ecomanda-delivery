# Status: Delete ProcessWebhookRequest service

**Current Status**: in-progress
**Last Updated**: 2026-06-02
**Agent**: claude-sonnet-4-6
**Branch**: main
**PR**: —

## Status History

| Timestamp | Status | Agent | Notes |
|-----------|--------|-------|-------|
| 2026-04-28 | not-started | — | Task created |
| 2026-06-02 | in-progress | claude-sonnet-4-6 | Starting execution |
| 2026-06-02 | blocked | claude-sonnet-4-6 | Unexpected callers found — see Blockers |
| 2026-06-02 | in-progress | claude-sonnet-4-6 | Blocker cleared: job consumer deleted in Phase 4 (task-12/13), safe to proceed |

## Blockers

**UNEXPECTED CALLERS — ABORT**

The grep `grep -r "ProcessWebhookRequest" src/ --include="*.ts" -l` returned files beyond the service and its spec:

1. `src/app/jobs/ProcessWebhookRequest.ts` — A background job that imports and invokes `processWebhookRequest` from the service. It registers a job with key `process-webhook-request` and passes data to the service.
2. `src/app/jobs/index.ts` (line 22) — Imports the job above, wiring it into the jobs registry.

The task assumed the service was **only called from IntegrationsController** (now deleted), but an active job consumer still references it. Deleting the service would break the jobs system.

**Resolution needed**: Decide whether `src/app/jobs/ProcessWebhookRequest.ts` and its entry in `src/app/jobs/index.ts` should also be removed as part of this or a companion task before the service can be safely deleted.

## Artifacts

None

## Adaptations

None
