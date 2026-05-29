# Task: Frontend: Setor CRUD + Baileys connect

**Plan**: Setores
**Phase**: 3
**Task ID (phase-local)**: task-05
**Task Path**: phase-3/task-05-frontend-setor-crud
**Depends On**: phase-2/task-03-multi-session-baileys
**JIRA**: N/A

## Objective

Create the Setor management UI: list, create, edit, and delete sectors. Include user multi-select and the Baileys connect flow (QR code) per sector. Visible only when `licensee.useSetores` is enabled.

## Context

Follow the existing page patterns. Good references:
- `client/src/pages/Users/` — CRUD for users with licensee association
- `client/src/pages/Licensees/` — includes Baileys QR flow (WhatsApp panel)

The Setor pages are accessible only to `admin` and `supervisor` roles (no sector management for `agent`). Gate the nav menu item and routes accordingly using the role from `AppContext.currentUser`.

The user multi-select on the sector form should use `react-select` with multi-mode (same component used for `SelectLicenseesWithFilter` but fetching users for the current licensee).

The Baileys connect flow within a sector reuses the same QR rendering logic already present in the Licensee form (WhatsApp panel), but calls `/resources/setores/:id/baileys-qr` and `/resources/setores/:id/baileys-status`.

`licensee.useSetores` toggle should appear in the Licensee edit form (WhatsApp settings panel). When disabled, the Setores nav item is hidden.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/setores/phase-3/task-05-frontend-setor-crud`
- [ ] Verify `phase-2/task-03-multi-session-baileys/status.md` shows `complete`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Read `client/src/pages/Users/` (scan structure and form patterns)
- [ ] Read `client/src/pages/Licensees/` (scan WhatsApp/Baileys panel)
- [ ] Read `client/src/pages/Navbar/index.js` (nav item pattern)
- [ ] Read `client/src/pages/routes.js` (route registration)
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Setores/` | create | Full CRUD pages (Index, New, Edit) |
| `client/src/services/setor.js` | create | API client for sector endpoints |
| `client/src/pages/Navbar/index.js` | modify | Add Setores nav item (role-gated) |
| `client/src/pages/routes.js` | modify | Register Setor routes |
| `client/src/pages/Licensees/` | modify | Add `useSetores` toggle to edit form |

### Do NOT Modify

- `client/src/pages/Messages/` — owned by phase-3/task-06-frontend-inbox-filtering
- `client/src/contexts/App/index.js` — owned by `local-chat-infra` plan

## Implementation Steps

### Step 1: Create `client/src/services/setor.js`

API client functions following the pattern of existing service files:
- `getSetores(filters)` — `GET /resources/setores?licensee=...`
- `getSetor(id)` — `GET /resources/setores/:id`
- `createSetor(data)` — `POST /resources/setores`
- `updateSetor(id, data)` — `PUT /resources/setores/:id`
- `deleteSetor(id)` — `DELETE /resources/setores/:id`
- `getSetorBaileysStatus(id)` — `GET /resources/setores/:id/baileys-status`
- `getSetorBaileysQr(id)` — `POST /resources/setores/:id/baileys-qr`
- `syncSetorBaileys(id)` — `POST /resources/setores/:id/baileys-sync`

### Step 2: Create Setor pages

`client/src/pages/Setores/scenes/Index/` — table listing sectors for current licensee, with Edit and Delete actions.

`client/src/pages/Setores/scenes/New/` — create form:
- Name (text input)
- Users (react-select multi, fetches users for current licensee)
- Active toggle
- Submit / Cancel

`client/src/pages/Setores/scenes/Edit/` — edit form (same fields) + Baileys panel:
- Same QR/status flow as Licensee form WhatsApp panel
- Calls `/resources/setores/:id/baileys-qr` and `/resources/setores/:id/baileys-status`
- "Sincronizar Grupos" calls `/resources/setores/:id/baileys-sync`

### Step 3: Add `useSetores` toggle to Licensee edit form

In the Licensee Edit form WhatsApp panel, add a checkbox/toggle for `useSetores`. When unchecked, the Setores nav item is hidden.

### Step 4: Register routes and nav item

Add routes in `client/src/pages/routes.js`:
```js
/setores          → Setores Index
/setores/new      → Setores New
/setores/:id/edit → Setores Edit
```

Add nav item in `Navbar/index.js` — visible only when `currentUser.role` is `admin` or `supervisor` AND `currentUser.licensee.useSetores` is `true` (or fetch from context).

## Testing

- [ ] Sector list page renders sectors for current licensee
- [ ] Create form validates: name required, at least one user
- [ ] Edit form loads existing sector data
- [ ] Baileys QR renders in Edit form (same behavior as Licensee form)
- [ ] Delete removes sector from list
- [ ] Nav item hidden when `useSetores = false`
- [ ] Nav item hidden for `agent` role
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc updates required at this task

## Completion Criteria

- [ ] Setor CRUD fully functional
- [ ] Baileys connect flow works per sector
- [ ] `useSetores` toggle in Licensee form
- [ ] Role-gated nav item
- [ ] Changes committed to `plan/setores/phase-3/task-05-frontend-setor-crud` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-06 modifies `client/src/pages/Messages/`. No overlap with this task.
