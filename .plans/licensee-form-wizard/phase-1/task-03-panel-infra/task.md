# Task: WhatsAppPanel + CartPanel + PagarMePanel + Pedidos10Panel

**Plan**: Licensee Form Wizard
**Task ID**: task-03
**Task Path**: phase-1/task-03-panel-infra
**Depends On**: phase-1/task-02-panel-comms
**JIRA**: N/A

## Before You Start

- [ ] Confirm task-02 branch exists and is complete
- [ ] Branch from task-02: `git switch plan/licensee-form-wizard/phase-1/task-02-panel-comms && git switch -c plan/licensee-form-wizard/phase-1/task-03-panel-infra`
- [ ] Read `Form/index.js` (post task-02) to see remaining JSX

## Context

Extract the 4 remaining fieldset groups into panel components.

### WhatsAppPanel fields (Form/index.js lines ~401–535)

- whatsappDefault (select: Utalk / Dialog360 / YCloud / Pabbly / Baileys)
- whatsappToken (text — hidden when `whatsappDefault === 'baileys'`)
- whatsappUrl (text — hidden when `whatsappDefault === 'baileys'`)
- useFileIDYcloud (checkbox — only when `whatsappDefault === 'ycloud'`)
- "Configurar Webhook no provedor" button — only when `whatsappDefault` is `dialog` or `ycloud` AND `values.apiToken` is set
- "Importar templates" button — same condition as above
- "Gerar QR Code" button + QRCodeSVG display — only when `whatsappDefault === 'baileys'`

The `baileysQr` and `baileysStatus` state currently lives in `Form/index.js`. Move it into `WhatsAppPanel` (self-contained). Receives `values.apiToken` and `values` as props for the service call and condition checks.

Props: `{ values, errors, touched, handleChange, handleBlur }`

Imports needed inside WhatsAppPanel:
```js
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { setLicenseeWebhook, getBaileysQr, importLicenseeTemplate } from '../../../../../services/licensee'
```

Remove `baileysQr`/`baileysStatus` state from `Form/index.js` once extracted.

### CartPanel fields (Form/index.js lines ~581–662)

- cartDefault (select: Alloy / Go2Go / Go2Go v2)
- useCartGallabox (checkbox)
- unidadeId (text)
- statusId (text)
- productFractionals (textarea, 10 rows)

Props: `{ values, errors, touched, handleChange, handleBlur }`

### PagarMePanel fields (Form/index.js lines ~664–814)

- financial_player_fee (number — "% Taxa")
- holder_name (text)
- holder_kind (select: Jurídica / Física)
- holder_document (text)
- bank, branch_number, branch_check_digit, account_number, account_check_digit (text)
- account_type (select: Corrente / Poupança)
- "Integrar com a Pagar.Me" button

Imports inside PagarMePanel:
```js
import { sendLicenseePagarMe } from '../../../../../services/licensee'
```

Props: `{ values, errors, touched, handleChange, handleBlur }`

### Pedidos10Panel fields (Form/index.js lines ~816–864)

- pedidos10_integrator (select — currently empty options; keep as-is)
- pedidos10_integration (textarea, 10 rows)
- "Assinar Webhook P10" button

Imports inside Pedidos10Panel:
```js
import { signOrderWebhook } from '../../../../../services/licensee'
```

Props: `{ values, errors, touched, handleChange, handleBlur }`

The `currentUser.isPedidos10` guard is NOT in this panel — it is handled by the tab shell in task-04.

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.js` | create | Manages its own baileysQr/baileysStatus state |
| `client/src/pages/Licensees/scenes/Form/panels/CartPanel.js` | create | |
| `client/src/pages/Licensees/scenes/Form/panels/PagarMePanel.js` | create | |
| `client/src/pages/Licensees/scenes/Form/panels/Pedidos10Panel.js` | create | |
| `client/src/pages/Licensees/scenes/Form/index.js` | modify | Replace remaining JSX; remove baileysQr state; remove service imports now in panels |

### Do NOT Modify

- `panels/MainPanel.js` (task-01)
- `panels/ChatPanel.js` / `panels/ChatbotPanel.js` (task-02)

## Conflict Avoidance Notes

Chain from task-02's branch (see Before You Start).

## Implementation Steps

### Step 1: Create WhatsAppPanel.js

- Move `baileysQr`/`baileysStatus` useState here
- Preserve all conditional rendering logic exactly as it is today
- Import `setLicenseeWebhook`, `getBaileysQr`, `importLicenseeTemplate` from services

### Step 2: Create CartPanel.js

Straightforward extraction — no conditionals inside.

### Step 3: Create PagarMePanel.js

Import and use `sendLicenseePagarMe`.

### Step 4: Create Pedidos10Panel.js

Import and use `signOrderWebhook`.

### Step 5: Update Form/index.js

- Replace the 4 extracted JSX blocks with panel imports
- Remove `baileysQr`, `baileysStatus` state declarations (moved to WhatsAppPanel)
- Remove service imports that are now owned by panels (`setLicenseeWebhook`, `getBaileysQr`, `importLicenseeTemplate`, `sendLicenseePagarMe`, `signOrderWebhook`)
- Keep `QRCodeSVG` import removal as well (now in WhatsAppPanel)

After this task, `Form/index.js` renders only: `<MainPanel>`, `<ChatPanel>`, `<ChatbotPanel>`, `<WhatsAppPanel>`, `<CartPanel>`, `<PagarMePanel>`, `<Pedidos10Panel>`.

## Testing

- [ ] Run `npx jest --testPathPattern=Licensees` — no failures
- [ ] Manual: verify WhatsApp fields and QR button still work (requires running backend for QR)
- [ ] Manual: verify Cart, PagarMe, Pedidos10 fields all render and save

## Documentation / KB Updates

No KB/doc updates required.

## Completion Criteria

- [ ] All 4 panel files created under `panels/`
- [ ] `Form/index.js` renders only panel components (no inline field JSX)
- [ ] baileysQr/baileysStatus state lives in WhatsAppPanel
- [ ] All tests pass
- [ ] `npx eslint .` passes
