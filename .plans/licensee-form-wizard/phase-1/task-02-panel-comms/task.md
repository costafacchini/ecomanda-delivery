# Task: ChatPanel + WhatsAppPanel

**Plan**: Licensee Form Wizard
**Task ID**: task-02
**Task Path**: phase-1/task-02-panel-comms
**Depends On**: phase-1/task-01-panel-general
**JIRA**: N/A

## Before You Start

- [ ] Read `client/src/pages/Licensees/scenes/Form/index.js` (after task-01 changes) to identify remaining field groups
- [ ] Identify all Formik props and helpers used by chat/whatsapp sections
- [ ] Identify baileysQr state and getBaileysQr service usage — these must be threaded as props to WhatsAppPanel

## Context

Extraction of the **chat/operator configuration** and **WhatsApp/messenger configuration** fields. The WhatsAppPanel is the most complex: it contains the Baileys QR code generation UI (introduced in the baileys-plugin plan), conditional rendering for token/URL vs. QR display, and local `baileysQr` state.

**ChatPanel** fields:
- attendant fields (attendantDefault?), productFractional, productRandomSorting, sendInactiveMessage, inactiveMessage

**WhatsAppPanel** fields:
- whatsappDefault (combobox — already in GeneralPanel; WhatsAppPanel shows conditional fields based on its value)
- whatsappToken, whatsappUrl (hidden when whatsappDefault === 'baileys')
- Gerar QR Code button + QRCodeSVG display (shown when whatsappDefault === 'baileys')
- baileysQr local state + getBaileysQr call

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Licensees/scenes/Form/panels/ChatPanel.js` | create | New panel component |
| `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.js` | create | New panel component; receives baileysQr/setBaileysQr as props OR manages its own local state |
| `client/src/pages/Licensees/scenes/Form/index.js` | modify | Replace inlined JSX with `<ChatPanel>` and `<WhatsAppPanel>` |

### Do NOT Modify

- `client/src/pages/Licensees/scenes/Form/panels/GeneralPanel.js` (task-01)
- `client/src/pages/Licensees/scenes/Form/panels/ChatbotPanel.js` (task-01)
- `client/src/pages/Licensees/scenes/Form/panels/AwsPanel.js` (task-03)
- Any other panel files (task-03)

## Conflict Avoidance Notes

Branch from task-01's branch (chained): `git switch plan/licensee-form-wizard/phase-1/task-01-panel-general && git switch -c plan/licensee-form-wizard/phase-1/task-02-panel-comms`

## Implementation Steps

### Step 1: Create ChatPanel.js
Extract chat-related fields. Props: `{ values, errors, touched, handleChange, handleBlur }`

### Step 2: Create WhatsAppPanel.js
Extract WhatsApp fields including:
- Conditional display of whatsappToken/whatsappUrl (hidden when `values.whatsappDefault === 'baileys'`)
- Gerar QR Code button (visible when `values.whatsappDefault === 'baileys'`)
- QRCodeSVG component for QR display

**State decision**: WhatsAppPanel manages its own `baileysQr` and `baileysQrStatus` local state (avoids lifting state to Form/index.js). It receives `licenseeId` as a prop for the API call.

Props: `{ values, errors, touched, handleChange, handleBlur, licenseeId }`

### Step 3: Update Form/index.js
Import and render `<ChatPanel>` and `<WhatsAppPanel>`. Remove now-extracted JSX. Pass `licenseeId` (available from the `licensee` prop or URL param) to WhatsAppPanel.

## Testing

- [ ] Run `npx jest --testPathPattern=Licensees` and confirm no failures
- [ ] Manual: switch whatsappDefault to 'baileys' — verify QR button appears, token/URL hide
- [ ] Manual: click Gerar QR Code — verify QR code displays (requires running backend)

## Documentation / KB Updates

No KB/doc updates required — presentational extraction only.

## Completion Criteria

- [ ] `ChatPanel.js` and `WhatsAppPanel.js` created under `panels/`
- [ ] `Form/index.js` imports and renders both panels
- [ ] Baileys QR generation still works end-to-end
- [ ] All tests pass
- [ ] `npx eslint .` passes
