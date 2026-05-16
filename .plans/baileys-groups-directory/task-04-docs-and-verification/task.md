# Task: Docs and Live Verification

**Plan**: Baileys Group Messaging & Directory Sync
**Phase**: 4
**Task ID (phase-local)**: task-04
**Task Path**: task-04-docs-and-verification
**Depends On**: [task-02-directory-sync-api, task-03-admin-sync-surface]
**JIRA**: N/A

## Objective

Update the Baileys documentation for the new sync/group-send flow and capture the live verification matrix needed because contact sync depends on a real linked WhatsApp account.

## Context

This repo already has a Baileys KB guide, and it currently documents QR pairing and the existing send/receive flow. After tasks 1-3 land, the guide and API docs will be stale unless they cover:

- the new sync endpoint
- how imported groups appear in the existing Contacts model/UI
- how group sends work through the existing message-creation flow
- the caveat that Baileys contact data comes from history/contact events rather than a single documented fetch-all method

Relevant files and docs:
- [docs/kb/features/baileys-whatsapp-guide.md](../../../docs/kb/features/baileys-whatsapp-guide.md)
- [docs/kb/README.md](../../../docs/kb/README.md)
- `API_DOCUMENTATION.md`

## Before You Start

- [ ] Switch to the planning/base branch and pull the latest plan state: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Read referenced architecture docs:
  - `docs/kb/features/baileys-whatsapp-guide.md`
  - `docs/kb/architecture/project-overview.md`
- [ ] Re-read the final endpoint/UX behavior from tasks 2 and 3 before editing docs
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `docs/kb/features/baileys-whatsapp-guide.md` | modify | Document sync flow, imported groups, and group send behavior |
| `API_DOCUMENTATION.md` | modify | Document the new admin sync endpoint and response |

### Do NOT Modify

- `src/app/plugins/messengers/Baileys.js` — owned by `task-01-plugin-core`
- `src/app/usecases/licensees/SyncBaileysDirectory.js` — owned by `task-02-directory-sync-api`
- `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.js` — owned by `task-03-admin-sync-surface`
- `client/src/pages/Contacts/scenes/Index/index.js` — owned by `task-03-admin-sync-surface`

## Implementation Steps

### Step 1: Update the KB guide

Extend `docs/kb/features/baileys-whatsapp-guide.md` with:
- how to trigger the new sync
- what gets imported into `Contact`
- how to inspect groups/contacts afterward
- how to send to an imported group through the existing message flow
- the known limitation/caveat around contact completeness

### Step 2: Update API documentation

Document the new admin endpoint, auth requirements, sample response, and expected error cases.

### Step 3: Run the live/manual verification matrix

Validate with a real linked Baileys session:
- QR/status still work
- sync returns counts
- imported `@c.us` and `@g.us` contacts appear in the Contacts screen
- a text message can be sent to an imported group

Capture any caveats directly in the KB doc instead of leaving them only in chat or commit history.

## Testing

- [ ] Re-run the targeted automated suites from tasks 1-3 or verify they are still green
- [ ] Manual: complete the live verification matrix above with a linked test WhatsApp account
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Update existing docs / KB files affected by this task
- [ ] If the final behavior required a reusable workaround not already captured, run `document-solution`
- [ ] If KB files change, run `check-kb-index`

## Completion Criteria

- [ ] KB guide documents sync, group inspection, and group send flow
- [ ] `API_DOCUMENTATION.md` documents the new admin endpoint
- [ ] Manual verification results are reflected in docs, including any limitations
- [ ] Documentation / KB updates completed or explicitly marked not needed
- [ ] Changes committed to `plan/baileys-groups-directory/task-04-docs-and-verification` branch
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- This task should describe the behavior that actually shipped. Do not edit docs speculatively before re-reading the final code from tasks 1-3.
