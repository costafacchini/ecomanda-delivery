# Task: Frontend — Inbox CRUD pages + services + types + i18n

**Plan**: inbox-concept
**Phase**: 4
**Task ID (phase-local)**: task-06
**Task Path**: phase-4/task-06-frontend-inbox-crud
**Spec References**: Story 1 (P1) — FR-001, FR-002, FR-003
**Depends On**: phase-2/task-03-auth-routing
**JIRA**: N/A

## Objective

Build the frontend Inbox management section: TypeScript types, API service, Index/New/Edit pages, navbar link, and full PT/EN i18n. Follow the Departments pages as the closest prior art.

## Context

The Departments pages are in `client/src/pages/Departments/` and are the closest prior art. The Inbox pages follow the exact same pattern: Index (list + delete), New (create), Edit (edit form with plugin config fields).

Key references:
- `client/src/pages/Departments/` — directory structure to clone
- `client/src/services/department.ts` — service pattern to follow
- `client/src/types/licensee.ts` — existing plugin field enums to reuse
- `client/src/factories/department.ts` — factory pattern for tests
- `client/src/pages/Navbar/index.tsx` — where to add the Inboxes link
- `client/src/i18n/locales/pt.json` — add `inboxes` namespace
- `client/src/i18n/locales/en.json` — add `inboxes` namespace
- `client/src/pages/routes.tsx` — where to register `/inboxes/*` route
- `client/src/pages/Departments/scenes/Edit/DepartmentBaileysPanel.tsx` — Baileys QR panel pattern

The Inbox form should show/hide fields based on `kind`:
- `kind='messenger'` → show `whatsappDefault`, `whatsappToken`, `whatsappUrl`, plus webhook URL + Baileys QR panel (if whatsappDefault='baileys')
- `kind='chat'` → show `chatDefault`, `chatUrl`, `chatKey`, `chatIdentifier`

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify phase-2/task-03 status.md shows `complete`
- [ ] Read `client/src/pages/Departments/scenes/Index/index.tsx` — understand list + delete pattern
- [ ] Read `client/src/pages/Departments/scenes/Edit/index.tsx` — understand edit form pattern
- [ ] Read `client/src/services/department.ts` — service function pattern
- [ ] Read `client/src/types/licensee.ts` — plugin field enums
- [ ] Mark task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/types/inbox.ts` | create | `IInbox` interface |
| `client/src/services/inbox.ts` | create | `getInboxes`, `createInbox`, `updateInbox`, `deleteInbox` |
| `client/src/services/inbox.spec.ts` | create | Service tests |
| `client/src/factories/inbox.ts` | create | fishery factory for frontend tests |
| `client/src/pages/Inboxes/routes.tsx` | create | `/inboxes/*` sub-routes |
| `client/src/pages/Inboxes/scenes/Index/index.tsx` | create | List + delete |
| `client/src/pages/Inboxes/scenes/Index/index.spec.tsx` | create | Index page tests |
| `client/src/pages/Inboxes/scenes/New/index.tsx` | create | Create form |
| `client/src/pages/Inboxes/scenes/New/index.spec.tsx` | create | New page tests |
| `client/src/pages/Inboxes/scenes/Edit/index.tsx` | create | Edit form |
| `client/src/pages/Inboxes/scenes/Edit/index.spec.tsx` | create | Edit page tests |
| `client/src/pages/Inboxes/scenes/Form/index.tsx` | create | Shared form component |
| `client/src/pages/Inboxes/scenes/Edit/InboxBaileysPanel.tsx` | create | Baileys QR panel for messenger inbox |
| `client/src/pages/routes.tsx` | modify | Register `/inboxes/*` route |
| `client/src/pages/Navbar/index.tsx` | modify | Add Inboxes link (conditional on licensee.useDepartments or always visible) |
| `client/src/pages/Navbar/index.spec.tsx` | modify | Add inboxes link test |
| `client/src/i18n/locales/pt.json` | modify | Add `inboxes` namespace |
| `client/src/i18n/locales/en.json` | modify | Add `inboxes` namespace |

### Do NOT Modify

- `client/src/pages/Departments/` — owned by phase-4/task-07-frontend-inbox-picker
- `client/src/pages/Chat/` — owned by phase-4/task-07-frontend-inbox-picker

## Implementation Steps

### Step 1: Types (`client/src/types/inbox.ts`)

```typescript
export interface IInbox {
  _id: string
  id: string
  name: string
  licensee: string
  kind: 'messenger' | 'chat'
  whatsappDefault?: string
  whatsappToken?: string
  whatsappUrl?: string
  chatDefault?: string
  chatUrl?: string
  chatKey?: string
  chatIdentifier?: string
  inboxToken: string
  webhookUrl: string | null
  active: boolean
}
```

### Step 2: Service (`client/src/services/inbox.ts`)

Follow `client/src/services/department.ts` exactly:
- `getInboxes({ licensee })` → GET `/resources/inboxes?licensee=X`
- `createInbox(data)` → POST `/resources/inboxes`
- `updateInbox(id, data)` → PUT `/resources/inboxes/:id`
- `deleteInbox(id)` → DELETE `/resources/inboxes/:id`

### Step 3: Factory (`client/src/factories/inbox.ts`)

Follow `client/src/factories/department.ts`.

### Step 4: Pages

Clone the `Departments` page structure. The Form component shows/hides fields based on `kind`. The Edit page includes `InboxBaileysPanel` (follow `DepartmentBaileysPanel.tsx`) for messenger inboxes with `whatsappDefault='baileys'`.

### Step 5: i18n

Add `inboxes` key to both locale files:

PT:
```json
"inboxes": {
  "title": "Inboxes",
  "newInbox": "Nova Inbox",
  "editInbox": "Editar Inbox",
  "deleteInboxTitle": "Excluir inbox",
  "deleteInboxConfirm": "Tem certeza que deseja excluir esta inbox?",
  "kind": { "messenger": "Mensageiro (WhatsApp)", "chat": "Chat" },
  "inboxToken": "Token da Inbox",
  "webhookUrl": "URL do Webhook",
  "active": "Ativo"
}
```

EN: analogous.

### Step 6: Navbar

Add an "Inboxes" link to the admin navbar following the same pattern as "Departments".

### Step 7: Routes

Register `/inboxes/*` in `client/src/pages/routes.tsx` following the Departments pattern.

## Testing

**Spec scenarios covered**:
- [ ] Story 1 / Scenario 1 — Inbox list rendered with names → `client/src/pages/Inboxes/scenes/Index/index.spec.tsx`
- [ ] Story 1 / Scenario 4 — Missing name shows validation error → form test
- [ ] Story 1 / Scenario 5 — Edit updates inbox → Edit page test
- [ ] Story 1 / Scenario 6 — Delete removes inbox → Index page test

**Additional verification**:
- [ ] `getInboxes` called with correct licensee id
- [ ] Form shows messenger fields when `kind='messenger'`, chat fields when `kind='chat'`
- [ ] `webhookUrl` displayed in Edit page for messenger inboxes
- [ ] `BaileysPanel` shown only when `whatsappDefault='baileys'`
- [ ] All existing frontend tests still pass: run `yarn test` in `client/`

## Documentation / KB Updates

- [ ] No new KB doc required — follows Departments pattern exactly

## Completion Criteria

- [ ] Inbox CRUD fully functional in the UI
- [ ] PT and EN i18n complete
- [ ] Navbar link present
- [ ] All spec scenarios for Story 1 (frontend side) pass
- [ ] Frontend tests green
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- task-07 owns `client/src/pages/Departments/` and `client/src/pages/Chat/`. Do not touch those.
- Both Phase 4 tasks are independent — no shared file ownership.
