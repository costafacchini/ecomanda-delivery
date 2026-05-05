# Task: Admin Form — Baileys QR Code Display

**Plan**: Baileys WhatsApp Plugin
**Phase**: 6
**Task ID (phase-local)**: task-06
**Task Path**: phase-6/task-06-admin-form
**Depends On**: phase-5/task-05-qr-endpoint
**JIRA**: N/A

## Objective

Update the licensee admin form to show a "Gerar QR Code" button and display the scanned QR image when the user selects `baileys` as the WhatsApp plugin. Mirror the Dialog webhook button pattern exactly.

## Context

**Form location:** `client/src/pages/Licensees/scenes/Form/index.js` (914 lines)

Dialog-specific section (lines ~464-491) renders conditionally on `whatsappDefault === 'dialog'`:
- A "Configurar Webhook no provedor" button
- An "Importar templates" button

We need to add an analogous section for `whatsappDefault === 'baileys'`:
- A "Gerar QR Code" button
- On click: call `getBaileysQr(licensee)` → POST `/resources/licensees/:id/baileys-qr`
- If response has `{ qr }`: render it as a QR image using `qrcode.react` (or render a `<img>` if endpoint returns base64)
- If response has `{ message: 'Já conectado' }`: show success toast/message

**Service layer:** `client/src/services/licensee.js` (50 lines)
- Add `getBaileysQr(licensee)` function mirroring `setLicenseeWebhook()`

**QR rendering:**
- Use `qrcode.react` package (renders a QR SVG/canvas from a string)
- Install: `cd client && yarn add qrcode.react`
- Or: if the backend returns a base64 PNG (add `qrcode` npm package to backend), just render `<img src={qr} />`
- **Recommended**: return raw QR string from backend, render with `qrcode.react` on frontend — keeps backend simple

**whatsappToken/whatsappUrl fields:**
- These fields are currently always rendered when `whatsappDefault` has a value
- For `baileys`, they should be hidden (no token/URL needed)
- Add condition: only render token/URL inputs when `whatsappDefault !== 'baileys'`

## Before You Start

- [ ] Verify `phase-5/task-05-qr-endpoint` status is `complete`
- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/baileys-plugin/phase-6/task-06-admin-form`
- [ ] Read `client/src/pages/Licensees/scenes/Form/index.js` lines 395-495 — understand Dialog conditional section
- [ ] Read `client/src/services/licensee.js` — understand service pattern
- [ ] Confirm QR rendering approach with user: `qrcode.react` (frontend) vs base64 from backend
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Licensees/scenes/Form/index.js` | modify | Add baileys section + hide token/URL for baileys |
| `client/src/services/licensee.js` | modify | Add getBaileysQr() function |
| `client/package.json` | modify | Add qrcode.react dependency |
| `client/yarn.lock` | modify | Updated by yarn |

### Do NOT Modify

- Any backend file — finalized in earlier phases
- `client/src/pages/Licensees/scenes/Edit/index.js` — read only, uses Form component

## Implementation Steps

### Step 1: Install qrcode.react

```bash
cd client && yarn add qrcode.react
```

### Step 2: Add getBaileysQr to licensee service

In `client/src/services/licensee.js`, add after the `setLicenseeWebhook` function:

```js
function getBaileysQr(licensee) {
  return api().post(`resources/licensees/${licensee.id}/baileys-qr`, { headers })
}
```

Export it alongside other functions.

### Step 3: Update Form/index.js

**a) Add import at top:**
```js
import QRCode from 'qrcode.react'
```

**b) Add state for QR:**
```js
const [baileysQr, setBaileysQr] = useState(null)
const [baileysStatus, setBaileysStatus] = useState(null)
```

**c) Add baileys section after the Dialog section (lines ~490):**
```jsx
{props.values.whatsappDefault === 'baileys' && (
  <div>
    <button
      onClick={async (event) => {
        event.preventDefault()
        setBaileysQr(null)
        setBaileysStatus(null)
        const response = await getBaileysQr(props.values)
        if (response.data?.qr) {
          setBaileysQr(response.data.qr)
        } else {
          setBaileysStatus(response.data?.message ?? 'Erro ao gerar QR')
        }
      }}
    >
      Gerar QR Code
    </button>
    {baileysQr && <QRCode value={baileysQr} size={200} />}
    {baileysStatus && <p>{baileysStatus}</p>}
  </div>
)}
```

**d) Hide token/URL fields for baileys:**

Find the `whatsappToken` and `whatsappUrl` input blocks and wrap with:
```jsx
{props.values.whatsappDefault !== 'baileys' && (
  // ... existing token/URL inputs
)}
```

**e) Add `'baileys'` option to the whatsappDefault dropdown:**
```jsx
<option value="baileys">Baileys</option>
```

### Step 4: Import getBaileysQr in Form

Add to the service imports at the top of Form/index.js:
```js
import { ..., getBaileysQr } from '../../../../services/licensee'
```

## Testing

- [ ] Start dev server: `yarn run dev`
- [ ] Navigate to a licensee edit form
- [ ] Select "Baileys" from the whatsappDefault dropdown — token/URL fields disappear
- [ ] Click "Gerar QR Code" — QR image appears (or "Já conectado" message)
- [ ] Select a different plugin ("dialog") — baileys section disappears, token/URL fields reappear
- [ ] `npx eslint client/src/` (or equivalent) passes clean

## Documentation / KB Updates

- [ ] No KB doc required — mirrors established Dialog webhook button pattern

## Completion Criteria

- [ ] `'baileys'` option visible in whatsappDefault dropdown
- [ ] Token/URL fields hidden when `baileys` is selected
- [ ] "Gerar QR Code" button visible when `baileys` is selected
- [ ] QR code renders in form after button click
- [ ] "Já conectado" message shown if already authenticated
- [ ] `getBaileysQr()` added to licensee service
- [ ] `qrcode.react` installed in client
- [ ] Manual smoke test passes
- [ ] Changes committed to `plan/baileys-plugin/phase-6/task-06-admin-form`
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

No parallel tasks in Phase 6 — this is the only task.
