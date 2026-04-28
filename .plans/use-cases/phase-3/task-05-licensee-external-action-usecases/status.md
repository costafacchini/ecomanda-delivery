# Status: Extract SetDialogWebhook, SendLicenseeToPagarMe, SignPedidos10OrderWebhook use cases

**Current Status**: complete
**Last Updated**: 2026-04-28T23:00Z
**Agent**: codex
**Branch**: `plan/use-cases/phase-3/task-05-licensee-external-action-usecases`
**PR**: —

## Status History

| Timestamp | Status | Agent | Notes |
|-----------|--------|-------|-------|
| 2026-04-28 | not-started | — | Task created |
| 2026-04-28T22:56Z | in-progress | codex | Branch created on top of the completed Phase 3 create/update use-case branch so task-06 can later depend on a single stacked Phase 3 line |
| 2026-04-28T23:00Z | complete | codex | Added the three licensee external-action use cases plus isolated specs; focused specs, full Jest suite, and repo lint passed on the existing warning baseline |

## Blockers

- `src/app/usecases/licensees/SetDialogWebhook.js`
- `src/app/usecases/licensees/SetDialogWebhook.spec.js`
- `src/app/usecases/licensees/SendLicenseeToPagarMe.js`
- `src/app/usecases/licensees/SendLicenseeToPagarMe.spec.js`
- `src/app/usecases/licensees/SignPedidos10OrderWebhook.js`
- `src/app/usecases/licensees/SignPedidos10OrderWebhook.spec.js`
- Verification: `npx jest src/app/usecases/licensees/`
- Verification: `npx jest`
- Verification: `yarn linter`

## Artifacts

- Injected plugin factories (`createMessengerPlugin`, `createPagarMe`, `createPedidos10`) instead of prebuilt plugin instances so the use cases match the existing controller/runtime wiring.
- Preserved the controller contract for `signOrderWebhook` by treating an empty `pedidos10_integration` object as missing login data.

## Adaptations

None
