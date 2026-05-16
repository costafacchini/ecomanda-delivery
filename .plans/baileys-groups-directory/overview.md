# Plan: Baileys Group Messaging & Directory Sync

**Status**: not-started
**Created**: 2026-05-16
**Last Updated**: 2026-05-16
**Estimated Demo Date**: 2026-05-23
**Assigned Dev**: Alan Costa Facchini
**Assigned QA**: unassigned

## Objective

Extend the existing Baileys integration so a connected WhatsApp account can sync its contacts and groups into the app's existing `Contact` model, and so outbound `to-messenger` messages can be sent directly to WhatsApp groups.

## Scope

### In Scope
- Reuse the existing Baileys session/auth flow to open an authenticated socket for on-demand directory sync
- Import WhatsApp contacts and groups into existing `Contact` records using `@c.us` / `@g.us` types
- Add an authenticated admin endpoint to trigger the sync and return import/update counts
- Support outbound Baileys sends to group JIDs stored on imported contacts
- Add admin UI controls to trigger sync and inspect imported groups through the existing Contacts surface
- Add automated tests and update the existing Baileys KB/API documentation

### Out of Scope
- Group creation, join/leave, participant management, or admin moderation actions — not requested
- Media/template feature expansion beyond the current Baileys plugin scope — only group-target delivery is required
- Full bidirectional WhatsApp address-book editing — the repo needs read/import behavior, not contact mutation on WhatsApp
- Reworking inbound group-routing behavior into chatbot/chat platforms — this plan focuses on sync/read and outbound group send

## Kill Criteria

- If live validation on the repo's resolved `@whiskeysockets/baileys` `7.0.0-rc11` cannot produce a usable contact list from `messaging-history.set` or related contact events for a linked device, stop and re-scope the feature to groups-only
- If a connected Baileys session cannot deliver a simple text message to a known `@g.us` JID in local smoke validation, stop and capture the vendor/library limitation before further implementation
- If on-demand directory sync cannot complete within a bounded 30-second request window for a typical linked account and no asynchronous fallback is acceptable, escalate before shipping

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Core Messenger Extension | task-01 | None | Extend the Baileys plugin with reusable socket helpers, directory fetch primitives, and group-aware send behavior |
| 2 | Sync API | task-02 | Phase 1 | Import synced contacts/groups into `Contact` records and expose an admin sync endpoint |
| 3 | Admin Surface | task-03 | Phase 2 | Add Licensee/Contacts UI affordances so admins can trigger sync and inspect imported groups |
| 4 | Docs & Verification | task-04 | Phase 2, Phase 3 | Update KB/API docs and capture the live verification matrix for the new flow |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| task-01-plugin-core | Baileys Group/Directory Core | 1 | not-started | — |
| task-02-directory-sync-api | Directory Sync API | 2 | not-started | task-01-plugin-core |
| task-03-admin-sync-surface | Admin Sync Surface | 3 | not-started | task-02-directory-sync-api |
| task-04-docs-and-verification | Docs and Live Verification | 4 | not-started | task-02-directory-sync-api, task-03-admin-sync-surface |

## Branch Convention

Pattern: `plan/baileys-groups-directory/{task-path}`

Example branches:
- `plan/baileys-groups-directory/task-01-plugin-core`
- `plan/baileys-groups-directory/task-02-directory-sync-api`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/app/plugins/messengers/Baileys.js` | Current Baileys socket/session/send implementation; group send and directory sync start here |
| `src/app/plugins/messengers/Baileys.spec.js` | Existing harness for plugin behavior and mocking socket events |
| `src/app/controllers/LicenseesController.js` | Current Baileys QR/status actions live here; sync endpoint should follow the same pattern |
| `src/app/usecases/licensees/` | Existing Baileys QR/status use cases provide the shape for a new sync use case |
| `src/app/routes/resources-routes.js` | Admin resource API route registration |
| `src/app/models/Contact.js` | Existing contact model already stores `type`, `number`, and `waId` needed for imported groups |
| `src/app/helpers/NormalizePhone.js` | Current `@c.us` / `@g.us` normalization behavior that imported entities must preserve |
| `src/app/queries/ContactsQuery.js` | Existing `type` filter can surface contacts vs groups without a new backend query layer |
| `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.js` | Current Baileys QR/status admin surface |
| `client/src/pages/Contacts/scenes/Index/index.js` | Existing Contacts UI where imported groups can be inspected |

## Risks

- Baileys contact retrieval is event/history-driven rather than a documented single `getAllContacts()` call — mitigate with an explicit on-demand sync flow and live validation against the linked device
- The current outbound send path assumes a person JID resolved via `onWhatsApp()` — mitigate with type-aware routing that sends `@g.us` contacts directly by stored `waId`
- Imported groups will reuse the legacy `Contact` model — mitigate with idempotent matching on `licensee + waId` and minimal mutation of unrelated contact fields

## Success Criteria

- [ ] A connected Baileys licensee can trigger an admin sync that imports/updates both WhatsApp contacts and groups
- [ ] Imported groups are stored as `Contact` records with stable `waId` and `type: '@g.us'`
- [ ] Existing contacts APIs/UI can distinguish contacts from groups without creating a new model or table
- [ ] A `to-messenger` message targeting an imported group contact is delivered through Baileys using the group JID
- [ ] Existing Baileys QR/status behavior continues to work
- [ ] All tests pass
- [ ] Required KB / documentation updates are complete or explicitly marked not needed
- [ ] No regressions in existing functionality

## References

- **JIRA Epic**: N/A
- **Weekly Plan Brief**: N/A
- **Related Plans**: [Baileys WhatsApp Plugin](../baileys-plugin/overview.md)
- **Rock Alignment**: N/A
