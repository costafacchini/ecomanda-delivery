# Task: Frontend — Department inbox selector + chat screen inbox picker

**Plan**: inbox-concept
**Phase**: 4
**Task ID (phase-local)**: task-07
**Task Path**: phase-4/task-07-frontend-inbox-picker
**Spec References**: Story 2 (P1) — FR-007; Story 5 (P2) — FR-012
**Depends On**: phase-2/task-03-auth-routing
**JIRA**: N/A

## Objective

1. Add an inbox selector field to the Department Edit form so admins can link a department to a messenger inbox.
2. Add an inbox picker modal to the chat screen's "Nova conversa" flow when the licensee has multiple active local chat inboxes.

## Context

**Department inbox selector**: The Department Edit form is at `client/src/pages/Departments/scenes/Edit/index.tsx`. It currently manages: name, users, active status. Add a `select` field for "Inbox" that shows all messenger inboxes for the licensee.

**Chat inbox picker**: The chat screen "Nova conversa" flow is in `client/src/pages/Chat/`. When the user clicks "Nova conversa", a modal or drawer opens. If the licensee has more than one active `kind='chat'` inbox, show an inbox selector step before the contact search. The selected `inboxId` is passed when creating the Room.

Key references:
- `client/src/pages/Departments/scenes/Edit/index.tsx`
- `client/src/pages/Departments/scenes/Edit/index.spec.tsx`
- `client/src/pages/Chat/index.tsx` — main chat screen
- `client/src/pages/Chat/index.spec.tsx` — chat screen tests
- `client/src/pages/Chat/components/` — check for existing modal/conversation components
- `client/src/services/inbox.ts` — `getInboxes` (created in task-06)
- `client/src/types/inbox.ts` — `IInbox` (created in task-06)
- `client/src/i18n/locales/pt.json` and `en.json` — add chat inbox picker strings

**Note**: task-06 creates `client/src/services/inbox.ts` and `client/src/types/inbox.ts`. If task-06 is not yet complete, stub the import and revisit.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify phase-2/task-03 status.md shows `complete`
- [ ] Verify phase-4/task-06 status.md shows `complete` (inbox service + types needed)
- [ ] Read `client/src/pages/Departments/scenes/Edit/index.tsx`
- [ ] Read `client/src/pages/Chat/index.tsx` — understand "Nova conversa" flow
- [ ] Mark task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Departments/scenes/Edit/index.tsx` | modify | Add inbox selector field |
| `client/src/pages/Departments/scenes/Edit/index.spec.tsx` | modify | Add inbox selector tests |
| `client/src/pages/Chat/index.tsx` | modify | Add inbox picker logic |
| `client/src/pages/Chat/index.spec.tsx` | modify | Add inbox picker tests |
| `client/src/pages/Chat/components/InboxPickerModal.tsx` | create | Inbox picker modal component |
| `client/src/pages/Chat/components/InboxPickerModal.spec.tsx` | create | Modal tests |
| `client/src/i18n/locales/pt.json` | modify | Add chat inbox picker strings |
| `client/src/i18n/locales/en.json` | modify | Add chat inbox picker strings |

### Do NOT Modify

- `client/src/pages/Inboxes/` — owned by phase-4/task-06-frontend-inbox-crud
- `client/src/services/inbox.ts` — owned by phase-4/task-06-frontend-inbox-crud
- `client/src/types/inbox.ts` — owned by phase-4/task-06-frontend-inbox-crud

## Implementation Steps

### Step 1: Department Edit form — inbox selector

In the Department Edit form, add a `select` field populated by calling `getInboxes({ licensee: currentUser.licensee._id })` and filtering for `kind='messenger'`.

```tsx
<Form.Group>
  <Form.Label>{t('departments.inbox')}</Form.Label>
  <Form.Select value={form.inbox ?? ''} onChange={e => setForm({ ...form, inbox: e.target.value || null })}>
    <option value="">{t('departments.noInbox')}</option>
    {messengerInboxes.map(inbox => (
      <option key={inbox._id} value={inbox._id}>{inbox.name}</option>
    ))}
  </Form.Select>
</Form.Group>
```

Include the `inbox` field in the PUT payload sent to `/resources/departments/:id`.

Add to PT i18n:
```json
"inbox": "Inbox (WhatsApp)",
"noInbox": "Nenhuma (usar config. padrão)"
```

### Step 2: `InboxPickerModal` component

Create `client/src/pages/Chat/components/InboxPickerModal.tsx`:

```tsx
interface Props {
  inboxes: IInbox[]
  onSelect: (inbox: IInbox) => void
  onDismiss: () => void
}
```

Renders a Bootstrap Modal with a list of inbox cards (name + kind badge). User selects one and clicks "Confirmar". Fires `onSelect(inbox)`.

### Step 3: Chat screen — picker trigger

In `client/src/pages/Chat/index.tsx`, in the "Nova conversa" handler:

```typescript
const handleNewConversation = async () => {
  const chatInboxes = await getInboxes({ licensee: currentUser.licensee._id, kind: 'chat', active: true })
  
  if (chatInboxes.length > 1) {
    setShowInboxPicker(true)
    setAvailableInboxes(chatInboxes)
    // Continue after user selects inbox in the modal
  } else {
    const inbox = chatInboxes[0] ?? null
    openContactSearch(inbox)
  }
}
```

After inbox selection → `openContactSearch(selectedInbox)` → pass `inboxId` in the Room creation payload.

### Step 4: i18n additions

PT:
```json
"chat": {
  "selectInbox": "Selecione uma inbox",
  "selectInboxDescription": "Esta conversa pertence a qual inbox?"
}
```

EN: analogous.

## Testing

**Spec scenarios covered**:
- [ ] Story 2 / Scenario 1 — Department Edit form shows inbox selector; PUT includes inbox → `client/src/pages/Departments/scenes/Edit/index.spec.tsx`
- [ ] Story 5 / Scenario 1 — Licensee with 2 chat inboxes → "Nova conversa" shows picker modal → `client/src/pages/Chat/index.spec.tsx`
- [ ] Story 5 / Scenario 2 — Licensee with 1 chat inbox → no picker shown, inbox auto-selected → `client/src/pages/Chat/index.spec.tsx`
- [ ] Story 5 / Scenario 3 — Agent selects inbox from modal → Room created with inbox id → `client/src/pages/Chat/index.spec.tsx`

**Additional verification**:
- [ ] Inbox selector in Department Edit shows only `kind='messenger'` inboxes for that licensee
- [ ] InboxPickerModal dismissal cancels the "Nova conversa" flow
- [ ] All existing frontend tests still pass: `yarn test` in `client/`

## Documentation / KB Updates

- [ ] No new KB doc required

## Completion Criteria

- [ ] Department Edit form shows and saves inbox selector
- [ ] Chat screen shows inbox picker modal when multiple chat inboxes exist
- [ ] Room is created with correct `inboxId` after picker selection
- [ ] PT and EN strings complete
- [ ] All spec scenarios for Stories 2 and 5 pass
- [ ] Frontend tests green
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- task-06 owns `client/src/pages/Inboxes/` and the inbox service/types. If task-06 is still in progress, stub the `getInboxes` import with a local mock and revisit.
- Both Phase 4 tasks are independent — no shared file ownership.
