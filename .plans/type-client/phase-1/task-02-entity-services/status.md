# Status: Entity Service Types

**Current Status**: complete
**Last Updated**: 2026-06-16
**Agent**: claude-sonnet-4-6
**Branch**: plan/type-client/phase-1/task-02-entity-services
**PR**: —

## Status History

| Timestamp | Status | Agent | Notes |
|-----------|--------|-------|-------|
| 2026-05-31 | not-started | — | Task created |
| 2026-06-16 | in-progress | claude-sonnet-4-6 | Branch created, starting implementation |
| 2026-06-16 | complete | claude-sonnet-4-6 | All service files typed, types stub created, tsc clean on owned files |

## Blockers

None

## Artifacts

### Modified Service Files
- `client/src/services/licensee.ts` — typed with ILicensee, ILicenseeFilters, ILicenseeInput; getBaileysQr/getBaileysStatus use Pick<ILicensee, 'id'>
- `client/src/services/contact.ts` — typed with IContact, IContactFilters, IContactInput
- `client/src/services/message.ts` — typed with IMessageFilters
- `client/src/services/template.ts` — typed with ITemplate, ITemplateFilters, ITemplateInput, ITemplateImportValues
- `client/src/services/trigger.ts` — typed with ITrigger, ITriggerFilters, ITriggerInput, ITriggerImportValues
- `client/src/services/user.ts` — typed with IUser, IUserFilters, IUserInput
- `client/src/services/dashboard.ts` — typed with IDashboardDateFilters, IDashboardOpenRoomsFilters; fixed pre-existing 3-arg bug in closeDashboardRoom
- `client/src/services/objectToQueryParameter.ts` — typed with Record<string, unknown> input, string return

### New Type Stubs (client/src/types/)
- `licensee.ts` — ILicensee, ILicenseeFilters, ILicenseeInput
- `contact.ts` — IContact, IContactFilters, IContactInput
- `message.ts` — IMessage, IMessageFilters, IMessageContact, IMessageSector, IMessageTrigger
- `template.ts` — ITemplate, ITemplateFilters, ITemplateInput, ITemplateImportValues
- `trigger.ts` — ITrigger, ITriggerFilters, ITriggerInput, ITriggerImportValues, TriggerKind
- `user.ts` — IUser, IUserFilters, IUserInput, UserRole
- `dashboard.ts` — IDashboardLicensees, IDashboardContacts, IDashboardMessageVolume, IDashboardDeliveryRate, IDashboardQueue, IDashboardConversations, IDashboardMessagesToday, IDashboardMessagesPerDay, IDashboardOpenRooms, IDashboardRoom, IDashboardDateFilters, IDashboardOpenRoomsFilters
- `pagination.ts` — IPaginatedResponse<T>, IBaseFilters
- `index.ts` — barrel re-export

## Adaptations

- `client/src/types/` is a temporary stub created because task-01 (canonical types) ran in parallel. When task-01 is merged first and this branch is rebased, conflicts in `client/src/types/` should be resolved in favour of task-01's versions.
- All filter interfaces include `[key: string]: unknown` index signature to satisfy `parseUrl`'s `Record<string, unknown>` parameter.
- `getBaileysQr` and `getBaileysStatus` accept `Pick<ILicensee, 'id'>` rather than full `ILicensee` because `BaileysSetupCard` (a Phase 2 page) passes `{ id: licenseeId }`.
- 5 remaining tsc errors are all in `src/pages/` Edit/Show scenes (Phase 2 task scope) — left untouched per task instructions.
- Pre-existing test failures: service spec files use `vi.mock` (Vitest) but the project test runner is Jest — not caused by this task.
- ESLint "ignored" warnings: root eslint.config.mjs only targets `src/**/*.ts` (backend), not `client/src/` — pre-existing gap, no lint errors in owned files.
