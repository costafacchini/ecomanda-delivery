# Status: Extract CreateTrigger, UpdateTrigger, ImportFacebookCatalog use cases

**Current Status**: complete
**Last Updated**: 2026-04-29T11:58Z
**Agent**: codex
**Branch**: `plan/use-cases/phase-6/task-11-trigger-usecases`
**PR**: —

## Status History

| Timestamp | Status | Agent | Notes |
|-----------|--------|-------|-------|
| 2026-04-28 | not-started | — | Task created |
| 2026-04-29T11:55Z | in-progress | codex | Branch created on top of the completed Phase 5 users-controller branch so the next domain slice builds on the latest verified local baseline |
| 2026-04-29T11:58Z | complete | codex | Added trigger create/update/import use cases plus isolated specs; focused trigger suite, full Jest suite, and repo lint passed on the existing warning baseline after carrying forward a Prettier-only fix from the previous stacked branch |

## Blockers

None

## Artifacts

- `src/app/usecases/triggers/CreateTrigger.js`
- `src/app/usecases/triggers/CreateTrigger.spec.js`
- `src/app/usecases/triggers/UpdateTrigger.js`
- `src/app/usecases/triggers/UpdateTrigger.spec.js`
- `src/app/usecases/triggers/ImportFacebookCatalog.js`
- `src/app/usecases/triggers/ImportFacebookCatalog.spec.js`
- Verification: `npx jest src/app/usecases/triggers/`
- Verification: `npx jest`
- Verification: `yarn linter`

## Adaptations

- Adapted the importer use case to receive `createFacebookCatalogImporter` and construct the importer inside `execute(triggerId, data)` so task-12 can inject a real use case instead of leaving factory orchestration in the controller.
- Carried forward a Prettier-only cleanup in `src/app/controllers/UsersController.spec.js` from the immediately preceding stacked branch because repo lint failed on that file before any trigger-specific errors surfaced.
