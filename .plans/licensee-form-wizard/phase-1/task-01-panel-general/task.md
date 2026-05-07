# Task: MainPanel

**Plan**: Licensee Form Wizard
**Task ID**: task-01
**Task Path**: phase-1/task-01-panel-general
**Depends On**: None
**JIRA**: N/A

## Before You Start

- [ ] Read `client/src/pages/Licensees/scenes/Form/index.js` in full
- [ ] Confirm `client/src/pages/Licensees/scenes/Form/panels/` does not yet exist
- [ ] Confirm task-06-remove-aws is complete (AWS fields removed from model) — or coordinate so MainPanel simply doesn't render them

## Context

Extract the **main tab fields** from `Form/index.js` into a `MainPanel` component. This panel contains identity data, read-only tokens/webhook URLs, and the 6 integration questions.

The 6 questions are **not** implemented here — they will be `props` passed in from `Form/index.js` (just checkboxes rendered via props). MainPanel is purely presentational; the question state lives in the parent.

### Fields to extract (lines 88–223 + 866–926 of current Form/index.js)

**Identity fields**:
- name (text)
- active (checkbox)
- kind (select: Jurídica / Física)
- document (text)
- email (text)
- licenseKind (select: Demonstração / Grátis / Pago)
- phone (text)
- apiToken (`disabled` — read-only, auto-generated)

**Read-only webhook URLs** (`disabled`):
- urlChatWebhook
- urlChatbotWebhook
- urlChatbotTransfer
- urlWhatsappWebhook

**6 integration questions** — rendered as checkboxes, values/handlers passed as props:
```
useChat        — "Integração com Plataforma de Chat?"
useChatbot     — "Integração com Plataforma de ChatBot?" (Formik field via props.values.useChatbot)
useWhatsapp    — "Integração com Plataforma de WhatsApp?"
useCart        — "Integração com Carrinho de Compras?"
usePagarMe     — "Integração com PagarMe?"
(Q6 Pedidos10) — rendered only when currentUser.isPedidos10, value = currentUser.isPedidos10 (read-only indicator)
```

> Note: Q1, Q3, Q4, Q5 are local state managed by `Form/index.js`; Q2 (`useChatbot`) is a Formik field. MainPanel receives all of them as props and just renders checkboxes.

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Licensees/scenes/Form/panels/MainPanel.js` | create | New panel component |
| `client/src/pages/Licensees/scenes/Form/index.js` | modify | Replace extracted JSX with `<MainPanel>`; remove awsId/awsSecret/bucketName from `licenseeInitialValues` and field JSX |

### Do NOT Modify

- Any other `panels/*.js` files (tasks 02 and 03)

## Conflict Avoidance Notes

Tasks 01, 02, 03 all modify `Form/index.js`. Run sequentially on chained branches:
- task-02 branches from task-01's branch
- task-03 branches from task-02's branch

## Implementation Steps

### Step 1: Create panels directory
```bash
mkdir -p client/src/pages/Licensees/scenes/Form/panels
```

### Step 2: Create MainPanel.js

Props interface:
```js
function MainPanel({
  values,          // Formik values
  errors,
  touched,
  handleChange,
  handleBlur,
  currentUser,     // for Q6 Pedidos10 visibility
  // Question state (local state from Form/index.js)
  useChat, setUseChat,
  useWhatsapp, setUseWhatsapp,
  useCart, setUseCart,
  usePagarMe, setUsePagarMe,
  setFieldValue,   // to reset chatDefault/whatsappDefault/cartDefault on uncheck
})
```

Question checkbox behaviour on uncheck:
- `useChat` off → `setFieldValue('chatDefault', '')`
- `useWhatsapp` off → `setFieldValue('whatsappDefault', '')`
- `useCart` off → `setFieldValue('cartDefault', '')`
- `usePagarMe` off → no field reset (preserve financial data)

### Step 3: Update Form/index.js

Replace the extracted JSX blocks with `<MainPanel {...questionProps} {...formikProps} currentUser={currentUser} />`.
Do NOT yet add tab structure — that is task-04.

## Testing

- [ ] Run `npx jest --testPathPattern=Licensees` — no failures
- [ ] Manual: verify all identity fields still render and save correctly
- [ ] Manual: verify read-only fields (apiToken, webhook URLs) are disabled
- [ ] No visual change expected

## Documentation / KB Updates

No KB/doc updates required — pure extraction.

## Completion Criteria

- [ ] `MainPanel.js` created under `panels/`
- [ ] `Form/index.js` imports and renders `<MainPanel>`
- [ ] No field lost or duplicated
- [ ] All tests pass
- [ ] `npx eslint .` passes
