# Task: Directory Sync API

**Plan**: Baileys Group Messaging & Directory Sync
**Phase**: 2
**Task ID (phase-local)**: task-02
**Task Path**: task-02-directory-sync-api
**Depends On**: task-01-plugin-core
**JIRA**: N/A

## Objective

Add an authenticated admin endpoint that triggers Baileys group sync, imports those groups into existing `Contact` records, and returns a deterministic sync summary to the client.

## Context

The repo already stores WhatsApp-facing identities in `Contact` records with `number`, `type`, `waId`, and `licensee`. That makes the import path lighter than creating a new `WhatsappContact` model.

Hard scope constraint:
- this sync must not read, import, or persist chat/message history
- groups must be imported as `Contact` records so they can be direct message destinations
- contact discovery is optional and not required for this task

Relevant files and docs:
- [docs/kb/features/baileys-whatsapp-guide.md](../../../docs/kb/features/baileys-whatsapp-guide.md)
- [docs/kb/architecture/project-overview.md](../../../docs/kb/architecture/project-overview.md)
- `src/app/controllers/LicenseesController.js`
- `src/app/controllers/LicenseesController.spec.js`
- `src/app/routes/resources-routes.js`
- `src/app/routes/resources-routes.spec.js`
- `src/app/models/Contact.js`
- `src/app/repositories/contact.js`
- `src/app/queries/ContactsQuery.js`
- `src/app/usecases/licensees/GetBaileysQr.js`
- `src/app/usecases/licensees/GetBaileysStatus.js`

Recommended endpoint shape:
- `POST /resources/licensees/:id/baileys-sync`

Recommended response shape:

```json
{
  "importedContacts": 0,
  "updatedContacts": 0,
  "importedGroups": 0,
  "updatedGroups": 0,
  "skipped": 0
}
```

## Before You Start

- [ ] Switch to the planning/base branch and pull the latest plan state: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Read referenced architecture docs:
  - `docs/kb/features/baileys-whatsapp-guide.md`
  - `docs/kb/architecture/project-overview.md`
- [ ] Re-read the normalized payload contract produced by `task-01-plugin-core`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/licensees/SyncBaileysDirectory.js` | create | Main orchestration/use case |
| `src/app/usecases/licensees/SyncBaileysDirectory.spec.js` | create | Unit coverage for import summary and matching logic |
| `src/app/controllers/LicenseesController.js` | modify | Add controller action and wire new use case |
| `src/app/controllers/LicenseesController.spec.js` | modify | Cover delegation/error handling for sync |
| `src/app/routes/resources-routes.js` | modify | Register the new authenticated route |
| `src/app/routes/resources-routes.spec.js` | modify | Cover route wiring/auth expectations |
| `src/app/repositories/contact.js` | modify | Optional helper extraction if idempotent matching/upsert becomes repetitive |
| `src/app/repositories/contact.spec.js` | modify | Only if repository behavior changes |

### Do NOT Modify

- `src/app/plugins/messengers/Baileys.js` — owned by `task-01-plugin-core`
- `src/app/plugins/messengers/Baileys.spec.js` — owned by `task-01-plugin-core`
- `client/src/services/licensee.js` — owned by `task-03-admin-sync-surface`
- `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.js` — owned by `task-03-admin-sync-surface`
- `client/src/pages/Contacts/scenes/Index/index.js` — owned by `task-03-admin-sync-surface`
- `docs/kb/features/baileys-whatsapp-guide.md` — owned by `task-04-docs-and-verification`
- `API_DOCUMENTATION.md` — owned by `task-04-docs-and-verification`

## Implementation Steps

### Step 1: Create the sync use case

Add a dedicated use case that:
- loads the licensee
- verifies `whatsappDefault === 'baileys'`
- calls the plugin directory-sync method from task 1
- transforms returned groups into `Contact` payloads

### Step 2: Make imports idempotent

Import/update records with this priority:
1. match on `licensee + waId`
2. fallback to `licensee + number + type`

Only mutate WhatsApp-identity fields that task 1 owns confidently (`name`, `number`, `type`, `waId`, `talkingWithChatBot`, `licensee`). Preserve unrelated user-maintained fields such as address/payment metadata.

Treat groups as first-class import targets:
- every imported group must become or update a `Contact` record with `type: '@g.us'`

### Step 3: Expose the resource endpoint

Wire the use case through `LicenseesController` and `resources-routes.js`, keeping the same auth pattern as existing `/baileys-status` and `/baileys-qr` routes.

## Testing

- [ ] `npx jest src/app/usecases/licensees/SyncBaileysDirectory.spec.js`
- [ ] `npx jest src/app/controllers/LicenseesController.spec.js`
- [ ] `npx jest src/app/routes/resources-routes.spec.js`
- [ ] `npx jest src/app/repositories/contact.spec.js` if repository helpers change
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No planned KB/doc updates in this task; `task-04-docs-and-verification` owns the final API/KB write-up
- [ ] If the import semantics differ materially from the task assumptions, document the adaptation in `status.md`
- [ ] If KB files change unexpectedly, run `check-kb-index`

## Completion Criteria

- [ ] An authenticated admin endpoint can trigger Baileys sync for a licensee
- [ ] Groups are imported idempotently into `Contact` records and can be used as direct message destinations
- [ ] The endpoint returns stable sync counts suitable for the UI
- [ ] Automated tests cover use case, controller, and route behavior
- [ ] Documentation / KB updates completed or explicitly marked not needed
- [ ] Changes committed to `plan/baileys-groups-directory/task-02-directory-sync-api` branch
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- `task-03-admin-sync-surface` will consume the response shape defined here. Do not rename response keys casually once the client work starts.
- If the sync path needs additional client-facing fields, add them additively rather than replacing the summary keys above.
