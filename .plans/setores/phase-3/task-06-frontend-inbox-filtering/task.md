# Task: Frontend: Inbox sector filtering

**Plan**: Setores
**Phase**: 3
**Task ID (phase-local)**: task-06
**Task Path**: phase-3/task-06-frontend-inbox-filtering
**Depends On**: phase-2/task-04-message-routing
**JIRA**: N/A

## Objective

Update the Messages page (inbox) so that agents see only conversations from their sector(s), sector name is shown on each conversation, and the filtering is transparent to the user — no manual filter selection required.

## Context

The Messages page (`client/src/pages/Messages/scenes/Index/`) currently:
- Shows all messages for a licensee when user is non-super
- Filters by `currentUser.licensee` automatically

With sectors enabled:
- `agent` and `supervisor` users belong to one or more sectors
- Their inbox should automatically filter to their sector(s)
- The backend access filtering (task-04) already enforces this at the repository level — the frontend just needs to NOT override it and display the sector label on each conversation

**Sector badge on conversation rows**: when `room.setor` is populated, show the sector name as a badge on the conversation row. This requires the room/message list endpoint to populate `setor.name`.

**Admin users** see everything regardless of sectors — no change to their existing behavior.

**No manual sector selector** in the inbox for agents — the filtering is automatic based on their sector membership. Admin/supervisor could optionally filter by sector, but that is explicitly deferred (out of scope for this task).

Read `client/src/pages/Messages/scenes/Index/index.js` to understand the current filter and rendering logic before making changes.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/setores/phase-3/task-06-frontend-inbox-filtering`
- [ ] Verify `phase-2/task-04-message-routing/status.md` shows `complete`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Read `client/src/pages/Messages/scenes/Index/index.js` (full file)
- [ ] Check what fields are returned by the rooms/messages list endpoint — confirm `setor.name` is populated
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Messages/scenes/Index/index.js` | modify | Remove manual licensee filter for agents; render sector badge |
| `client/src/pages/Messages/` | modify | Any sub-components used by the index scene |

### Do NOT Modify

- `client/src/pages/Setores/` — owned by phase-3/task-05-frontend-setor-crud
- `client/src/pages/Navbar/index.js` — owned by phase-3/task-05-frontend-setor-crud

## Implementation Steps

### Step 1: Verify backend population

Confirm that the rooms/messages list API response includes `setor` with at least `{ _id, name }`. If not, check the controller/repository that serves the Messages page and ensure `.populate('setor', 'name')` is applied.

### Step 2: Sector badge on conversation rows

In the conversation list render, when `room.setor` is present, add a small badge showing `room.setor.name`. Follow the existing badge/tag pattern in the Messages page if one exists, or use a simple Bootstrap `badge` element.

### Step 3: Agent auto-filter

Current filter for non-super:
```js
if (currentUser && !currentUser.isSuper && filters.licensee !== currentUser.licensee) {
  setFilters({ ...filters, licensee: currentUser.licensee })
}
```

After roles are implemented (from `local-chat-infra`), extend this:
- For `agent`/`supervisor` roles: the backend already filters by sector — no additional frontend query param needed
- Remove or guard the `SelectLicenseesWithFilter` component so it does not appear for agents (it should already be role-gated in `local-chat-infra`, but verify)

### Step 4: Admin sector filter (deferred — do NOT implement)

An optional "Filter by sector" dropdown for admins is explicitly out of scope for this task. Add a `// TODO: sector filter for admin — deferred` comment as a marker.

## Testing

- [ ] Agent user inbox does not show conversations from other sectors
- [ ] Sector badge renders on conversation rows where `room.setor` is populated
- [ ] Conversations with `room.setor = null` (main number) show no sector badge
- [ ] Admin user sees all conversations regardless of sector
- [ ] No regression in existing Messages page behavior for non-sector licensees
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Update `docs/kb/features/baileys-whatsapp-guide.md` — add a note that sector sockets route messages to sector-specific rooms
- [ ] Run `check-kb-index` after KB changes

## Completion Criteria

- [ ] Sector badge visible on conversation rows
- [ ] Agent inbox automatically filtered by sector (via backend, transparent to user)
- [ ] Admin inbox unaffected
- [ ] KB doc updated
- [ ] All plan Success Criteria checked off
- [ ] Changes committed to `plan/setores/phase-3/task-06-frontend-inbox-filtering` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-05 modifies `Navbar` and `routes.js`. No overlap with this task.
