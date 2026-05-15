# Status: Error Response Hardening

**Current Status**: complete
**Last Updated**: 2026-05-14
**Agent**: claude-sonnet-4-6
**Branch**: security-hardening
**PR**: —

## Status History

| Timestamp | Status | Agent | Notes |
|-----------|--------|-------|-------|
| 2026-05-14 | not-started | — | Task created |
| 2026-05-14 | in-progress | claude-sonnet-4-6 | Implementation started |
| 2026-05-14 | complete | claude-sonnet-4-6 | All 2699 tests pass |

## Blockers

None

## Artifacts

- `src/config/http.js` — fixed 4-arg error handler, added appLogger import
- `src/app/controllers/LoginController.js` — removed `${err}` from response
- `src/app/controllers/UsersController.js` — removed err.toString(), CastError detection fixed
- `src/app/controllers/CartsController.js` — removed err.toString() (9 occurrences)
- `src/app/controllers/ContactsController.js` — removed err.toString(), CastError detection fixed
- `src/app/controllers/MessagesController.js` — removed err.toString()
- `src/app/controllers/TemplatesController.js` — removed err.toString(), CastError detection fixed
- `src/app/controllers/DashboardController.js` — removed err.toString() (8 occurrences)
- `src/app/controllers/LicenseesController.js` — removed err.toString(), CastError detection fixed
- `src/app/controllers/BackgroundjobsController.js` — removed err.toString(), CastError detection fixed
- `src/app/controllers/TriggersController.js` — removed err.toString(), CastError detection fixed
- `src/app/controllers/Contacts/AdressesController.js` — removed err.toString()
- All corresponding spec files updated to assert on new generic messages and proper CastError mocks

## Adaptations

None
