# Task: Baileys Group/Directory Core

**Plan**: Baileys Group Messaging & Directory Sync
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: task-01-plugin-core
**Depends On**: None
**JIRA**: N/A

## Objective

Extend the Baileys messenger plugin so it can fetch group/contact directory data from a connected WhatsApp account and send outbound messages directly to imported group JIDs.

## Context

The repo already has a working Baileys session flow for QR pairing, status checks, inbound message parsing, and person-to-person sends. The missing capability is a reusable authenticated socket path that can serve three needs without duplicating connection logic:

- directory sync primitives for groups and contacts
- type-aware outbound sends for `@g.us` contacts
- shared session handling that still preserves the current QR/status behavior

Relevant files and docs:
- [docs/kb/features/baileys-whatsapp-guide.md](../../../docs/kb/features/baileys-whatsapp-guide.md)
- [docs/kb/architecture/project-overview.md](../../../docs/kb/architecture/project-overview.md)
- `src/app/plugins/messengers/Baileys.js`
- `src/app/plugins/messengers/Baileys.spec.js`
- Baileys History Sync docs: `https://baileys.wiki/docs/socket/history-sync/`
- Baileys Receiving Updates docs: `https://baileys.wiki/docs/socket/receiving-updates/`
- Baileys API docs for `groupFetchAllParticipating()`: `https://baileys.wiki/docs/api/functions/makeWASocket/`

Important implementation constraint:
- groups are directly supported by Baileys via `groupFetchAllParticipating()` and `sendMessage(groupJid, ...)`
- contact import is less direct and must rely on history/contact events (`messaging-history.set`, `contacts.upsert`, `contacts.update`) or store binding

## Before You Start

- [ ] Switch to the planning/base branch and pull the latest plan state: `git switch main && git pull --rebase origin main`
- [ ] Verify `Depends On` is satisfied
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Read referenced architecture docs:
  - `docs/kb/features/baileys-whatsapp-guide.md`
  - `docs/kb/architecture/project-overview.md`
- [ ] Review the current plugin/test shape in `src/app/plugins/messengers/Baileys.js` and `src/app/plugins/messengers/Baileys.spec.js`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/messengers/Baileys.js` | modify | Add reusable socket helpers, directory fetch, and group-aware send logic |
| `src/app/plugins/messengers/Baileys.spec.js` | modify | Cover directory sync primitives and `@g.us` outbound sends |
| `src/app/plugins/messengers/baileys/` | create | Optional helper module(s) if the socket/session logic needs extraction to keep `Baileys.js` readable |

### Do NOT Modify

- `src/app/controllers/LicenseesController.js` — owned by `task-02-directory-sync-api`
- `src/app/routes/resources-routes.js` — owned by `task-02-directory-sync-api`
- `src/app/usecases/licensees/` — owned by `task-02-directory-sync-api`
- `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.js` — owned by `task-03-admin-sync-surface`
- `client/src/pages/Contacts/scenes/Index/index.js` — owned by `task-03-admin-sync-surface`
- `docs/kb/features/baileys-whatsapp-guide.md` — owned by `task-04-docs-and-verification`
- `API_DOCUMENTATION.md` — owned by `task-04-docs-and-verification`

## Implementation Steps

### Step 1: Consolidate authenticated socket/session helpers

Refactor the current `Baileys.js` connection bootstrap so QR generation, outbound send, and directory sync can share the same session-loading, `creds.update`, connection lifecycle, and cleanup behavior without copy/paste branching.

### Step 2: Add directory retrieval primitives

Implement a plugin method that returns a normalized sync payload for:
- groups from `groupFetchAllParticipating()`
- contacts collected from `messaging-history.set` and/or contact update events within a bounded wait window

Define a stable internal result shape for task 2 to consume, for example:

```json
{
  "contacts": [{ "waId": "5511999999999", "name": "Jane", "number": "5511999999999", "type": "@c.us" }],
  "groups": [{ "waId": "1203630...@g.us", "name": "Sales Team", "number": "1203630...-...", "type": "@g.us" }]
}
```

### Step 3: Make outbound sends group-aware

Update `sendMessage()` so:
- `@c.us` contacts still resolve/validate person JIDs appropriately
- `@g.us` contacts bypass `onWhatsApp()` lookup and send directly to the stored group JID
- failure paths still persist `message.error` and preserve the existing queue behavior

## Testing

- [ ] Add/adjust plugin specs for group directory retrieval behavior
- [ ] Add/adjust plugin specs proving `sendMessage()` delivers to a stored `@g.us` JID without resolving it as a person number
- [ ] `npx jest src/app/plugins/messengers/Baileys.spec.js`
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No planned KB/doc updates in this task; `task-04-docs-and-verification` owns the user-facing docs
- [ ] If the implementation requires a non-obvious Baileys history-sync workaround, run `document-solution`
- [ ] If KB files change unexpectedly, run `check-kb-index`

## Completion Criteria

- [ ] `Baileys.js` exposes a reusable directory-fetch path that task 2 can call
- [ ] Group sends use the stored group JID instead of person-number resolution
- [ ] Plugin tests cover group sync and group send behavior
- [ ] Documentation / KB updates completed or explicitly marked not needed
- [ ] Changes committed to `plan/baileys-groups-directory/task-01-plugin-core` branch
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- `task-02-directory-sync-api` will consume the normalized sync payload created here. Keep that payload shape explicit and stable to avoid controller/use-case churn.
- Do not modify Licensee controller/routes in this task. If a small API hook feels necessary, document it in the task branch notes and leave implementation to task 2.
