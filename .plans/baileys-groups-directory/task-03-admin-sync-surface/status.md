# Status: Admin Sync Surface

**Current Status**: complete
**Last Updated**: 2026-05-16
**Agent**: claude-sonnet-4-6
**Branch**: task-03-baileys-groups-directory-admin-sync-surface
**PR**: —

## Status History

| Timestamp | Status | Agent | Notes |
|-----------|--------|-------|-------|
| 2026-05-16 | not-started | — | Task created |
| 2026-05-16 | in-progress | claude-sonnet-4-6 | Implementation started |
| 2026-05-16 | complete | claude-sonnet-4-6 | syncBaileysDirectory service, Sync Groups button in WhatsAppPanel, group filter toggle in Contacts index; 207 tests passing |

## Blockers

None

## Artifacts

- `client/src/services/licensee.js` — added `syncBaileysDirectory` function for `POST /resources/licensees/:id/baileys-sync`
- `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.js` — added "Sincronizar Grupos" button (visible when Baileys connected and licensee persisted), with loading state, success counts display, and error message
- `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.spec.js` — added 4 specs for sync button behavior
- `client/src/pages/Contacts/scenes/Index/index.js` — added group filter toggle button ("Todos os Contatos" / "Apenas Grupos") that sends `?isGroup=true` to backend
- `client/src/pages/Contacts/scenes/Index/index.spec.js` — added 4 specs for group filter toggle behavior

## Adaptations

- Branch named `task-03-baileys-groups-directory-admin-sync-surface` (flat) because `plan/baileys-groups-directory` already exists as a branch ref
- Task instructions referenced `npx jest` but the client uses Vitest; ran `npx vitest run` instead
- `updatedAt` date filter UI not added per task spec; backend-only for now (documented here as requested)
