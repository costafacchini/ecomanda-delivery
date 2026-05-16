# Task: Admin Sync Surface

**Plan**: Baileys Group Messaging & Directory Sync
**Phase**: 3
**Task ID (phase-local)**: task-03
**Task Path**: task-03-admin-sync-surface
**Depends On**: task-02-directory-sync-api
**JIRA**: N/A

## Objective

Add admin UI affordances so a Baileys-connected licensee can trigger group sync, see the result immediately, and inspect imported groups through the existing Contacts view.

## Context

The existing admin surface already supports Baileys QR generation and connection status in the Licensee form. The Contacts page already renders `contact.type`, but it does not yet expose a fast UI filter for distinguishing imported groups from regular contacts.

Relevant files and docs:
- `client/src/services/licensee.js`
- `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.js`
- `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.spec.js`
- `client/src/pages/Contacts/scenes/Index/index.js`
- `client/src/pages/Contacts/scenes/Index/index.spec.js`
- `client/src/services/contact.js`

Expected UX:
- when Baileys is connected, show a sync action in the WhatsApp panel
- after sync, show counts returned by the backend
- make it easy to filter/read `@g.us` records on the Contacts page
- do not add new contact-search UI as part of this task
- prefer the backend `isGroup` filter instead of client-side-only filtering

## Before You Start

- [ ] Switch to the planning/base branch and pull the latest plan state: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Read referenced architecture docs:
  - `docs/kb/features/baileys-whatsapp-guide.md`
  - `docs/kb/architecture/project-overview.md`
- [ ] Review the response contract from `task-02-directory-sync-api`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/services/licensee.js` | modify | Add client helper for the new sync endpoint |
| `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.js` | modify | Add sync action/result state to the Baileys admin panel |
| `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.spec.js` | modify | Cover sync action and result rendering |
| `client/src/pages/Contacts/scenes/Index/index.js` | modify | Add easy contact/group filtering or another minimal read affordance |
| `client/src/pages/Contacts/scenes/Index/index.spec.js` | modify | Cover the new filter/read behavior |

### Do NOT Modify

- `src/app/plugins/messengers/Baileys.js` — owned by `task-01-plugin-core`
- `src/app/usecases/licensees/SyncBaileysDirectory.js` — owned by `task-02-directory-sync-api`
- `src/app/controllers/LicenseesController.js` — owned by `task-02-directory-sync-api`
- `src/app/routes/resources-routes.js` — owned by `task-02-directory-sync-api`
- `docs/kb/features/baileys-whatsapp-guide.md` — owned by `task-04-docs-and-verification`
- `API_DOCUMENTATION.md` — owned by `task-04-docs-and-verification`

## Implementation Steps

### Step 1: Add the client service call

Extend `client/src/services/licensee.js` with a method for `POST /resources/licensees/:id/baileys-sync`.

### Step 2: Surface sync in the WhatsApp panel

Update `WhatsAppPanel` to:
- show the sync action only when Baileys is connected and the licensee is persisted
- render loading, success, and failure states cleanly
- display the returned counts in a compact, readable way

### Step 3: Make imported groups easy to inspect

Use the existing Contacts page rather than adding a brand-new screen. Add a minimal filter/toggle so admins can switch among:
- all contacts
- WhatsApp groups (`@g.us`)

If date filtering is surfaced in the UI during this task, use the backend `updatedAt` filter rather than local client filtering. If the UI does not need that control yet, leave the API support backend-only and document that choice in `status.md`.

## Testing

- [ ] `npx jest client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.spec.js`
- [ ] `npx jest client/src/pages/Contacts/scenes/Index/index.spec.js`
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No planned KB/doc updates in this task; `task-04-docs-and-verification` owns the final guide/API changes
- [ ] If the shipped UX diverges from this task, capture the reasoning in `status.md`
- [ ] If KB files change unexpectedly, run `check-kb-index`

## Completion Criteria

- [ ] Admins can trigger Baileys sync from the Licensee WhatsApp panel
- [ ] Sync success/failure/result counts are visible in the UI
- [ ] Contacts UI can clearly surface imported groups
- [ ] Automated tests cover the new panel/filter behavior
- [ ] Documentation / KB updates completed or explicitly marked not needed
- [ ] Changes committed to `plan/baileys-groups-directory/task-03-admin-sync-surface` branch
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- Keep the client dependent on the summary payload from task 2 only. Do not re-encode backend transformation rules in the UI.
- Prefer additive UI changes in existing screens over creating a new standalone Baileys directory page.
