# Status: Delete ProcessPagarmeOrderPaid and SendContactToPagarMe services

**Current Status**: blocked
**Last Updated**: 2026-06-02
**Agent**: claude-sonnet-4-6
**Branch**: main
**PR**: —

## Status History

| Timestamp | Status | Agent | Notes |
|-----------|--------|-------|-------|
| 2026-04-28 | not-started | — | Task created |
| 2026-06-02 | in-progress | claude-sonnet-4-6 | Executing deletion of PagarMe services |
| 2026-06-02 | blocked | claude-sonnet-4-6 | Unexpected consumers found in src/app/jobs/ — aborted per instructions |

## Blockers

**ABORT — Unexpected consumers detected outside `src/app/services/`:**

The following files outside `src/app/services/` import the target service files and would break if the services were deleted:

- `src/app/jobs/SendContactToPagarMe.ts` — imports `sendContactToPagarMe` from `../services/SendContactToPagarMe`
- `src/app/jobs/ProcessPagarmeOrderPaid.ts` — imports `processPagarmeOrderPaid` from `../services/ProcessPagarmeOrderPaid`
- `src/app/jobs/index.ts` — imports both job wrappers (which themselves import the services)

These job files must be removed/updated before the service files can be safely deleted. This task depends on those jobs being removed first. Task aborted per instructions.

## Artifacts

None

## Adaptations

None
