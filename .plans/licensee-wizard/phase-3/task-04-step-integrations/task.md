# Task: Steps 2-7 — Integration Yes/No Steps

**Plan**: Licensee Create Wizard + Edit Simplification
**Task ID**: task-04
**Task Path**: phase-3/task-04-step-integrations
**Depends On**: phase-3/task-03-step-identity  ← branch from task-03, NOT task-02
**JIRA**: N/A

## Before You Start

- [ ] Confirm `phase-3/task-03-step-identity` is `complete`
- [ ] Branch from task-03: `git switch plan/licensee-wizard/phase-3/task-03-step-identity && git switch -c plan/licensee-wizard/phase-3/task-04-step-integrations`
- [ ] Read `LicenseeWizard.js` — find the `// STEPS 2-7 ADDED IN task-04 ↓` markers
- [ ] Read each panel: ChatPanel, ChatbotPanel, WhatsAppPanel, CartPanel, PagarMePanel, Pedidos10Panel

## Context

Implement steps 2-7. Each step uses a Yes/No gate: Yes reveals the integration fields (panel
component); No hides them and allows Next without validation. Yes/No selection is pure UI
state — not a backend field (except `useChatbot`, which is a Formik field).

### YesNoGate helper component

Create inside `LicenseeWizard.js` (above the main component, below `IdentityStep`):

```jsx
function YesNoGate({ label, isYes, onChange }) {
  return (
    <div className='mb-3'>
      <p className='fw-semibold'>{label}</p>
      <div className='btn-group' role='group'>
        <button
          type='button'
          className={`btn ${isYes === true ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => onChange(true)}
        >
          Sim
        </button>
        <button
          type='button'
          className={`btn ${isYes === false ? 'btn-secondary' : 'btn-outline-secondary'}`}
          onClick={() => onChange(false)}
        >
          Não
        </button>
      </div>
    </div>
  )
}
```

Initial state: `null` (neither Sim nor Não selected). When null or false, treat as No.

### Yes/No state variables (add at top of LicenseeWizard component)

```js
const [useChat,      setUseChat]      = useState(null)
const [useWhatsapp,  setUseWhatsapp]  = useState(null)
const [useCart,      setUseCart]      = useState(null)
const [usePagarMe,   setUsePagarMe]   = useState(null)
const [usePedidos10, setUsePedidos10] = useState(null)
// useChatbot → formik.values.useChatbot (Formik field, not local state)
```

### Step 2 — Chat

```jsx
{step.id === 'chat' && (
  <>
    <YesNoGate
      label='Deseja integrar com uma Plataforma de Chat?'
      isYes={useChat}
      onChange={setUseChat}
    />
    {useChat && (
      <ChatPanel
        values={formik.values}
        errors={formik.errors}
        touched={formik.touched}
        handleChange={formik.handleChange}
        handleBlur={formik.handleBlur}
      />
    )}
  </>
)}
```

Yup schema (applied only when `useChat === true`):
```js
const chatSchema = Yup.object().shape({
  chatDefault: Yup.string().required('Chat padrão é obrigatório'),
  chatUrl:     Yup.string().required('URL do chat é obrigatória'),
  chatIdentifier: Yup.string().when('chatDefault', {
    is: (v) => ['crisp', 'chatwoot'].includes(v),
    then: (s) => s.required('Identifier é obrigatório'),
  }),
  chatKey: Yup.string().when('chatDefault', {
    is: (v) => ['crisp', 'chatwoot'].includes(v),
    then: (s) => s.required('Key é obrigatória'),
  }),
})
```

### Step 3 — ChatBot

`useChatbot` is a Formik field. Derive Yes/No from `formik.values.useChatbot`.

```jsx
{step.id === 'chatbot' && (
  <>
    <YesNoGate
      label='Deseja integrar com uma Plataforma de ChatBot?'
      isYes={formik.values.useChatbot || null}
      onChange={(val) => formik.setFieldValue('useChatbot', val)}
    />
    {formik.values.useChatbot && (
      <ChatbotPanel
        values={formik.values}
        errors={formik.errors}
        touched={formik.touched}
        handleChange={formik.handleChange}
        handleBlur={formik.handleBlur}
      />
    )}
  </>
)}
```

Yup schema (when `useChatbot === true`):
```js
const chatbotSchema = Yup.object().shape({
  chatbotDefault:             Yup.string().required('Chatbot padrão é obrigatório'),
  chatbotUrl:                 Yup.string().required('URL do chatbot é obrigatória'),
  chatbotAuthorizationToken:  Yup.string().required('Token do chatbot é obrigatório'),
  chatbotApiToken:            Yup.string().required('Token de API é obrigatório'),
  messageOnResetChatbot:      Yup.string().required('Mensagem de reset é obrigatória'),
  messageOnCloseChat:         Yup.string().required('Mensagem de encerramento é obrigatória'),
})
```

### Step 4 — WhatsApp

```jsx
{step.id === 'whatsapp' && (
  <>
    <YesNoGate
      label='Deseja integrar com uma Plataforma de WhatsApp?'
      isYes={useWhatsapp}
      onChange={setUseWhatsapp}
    />
    {useWhatsapp && (
      <WhatsAppPanel
        values={formik.values}
        errors={formik.errors}
        touched={formik.touched}
        handleChange={formik.handleChange}
        handleBlur={formik.handleBlur}
      />
    )}
  </>
)}
```

Note: WhatsAppPanel self-manages `baileysQr`/`baileysStatus` state and QR generation —
those features only work in Edit (require existing licensee). In the Create wizard context,
the "Gerar QR Code" button will be visible when baileys is selected but won't work without
an existing licensee. This is acceptable; document in Adaptations if it becomes an issue.

Yup schema (when `useWhatsapp === true`):
```js
const whatsappSchema = Yup.object().shape({
  whatsappDefault: Yup.string().required('WhatsApp padrão é obrigatório'),
  whatsappToken: Yup.string().when('whatsappDefault', {
    is: (v) => v && v !== 'baileys',
    then: (s) => s.required('Token do WhatsApp é obrigatório'),
  }),
  whatsappUrl: Yup.string().when('whatsappDefault', {
    is: (v) => v && v !== 'baileys',
    then: (s) => s.required('URL do WhatsApp é obrigatória'),
  }),
})
```

### Step 5 — Carrinho

```jsx
{step.id === 'carrinho' && (
  <>
    <YesNoGate
      label='Deseja integrar com um Carrinho de Compras?'
      isYes={useCart}
      onChange={setUseCart}
    />
    {useCart && (
      <CartPanel
        values={formik.values}
        errors={formik.errors}
        touched={formik.touched}
        handleChange={formik.handleChange}
        handleBlur={formik.handleBlur}
      />
    )}
  </>
)}
```

Yup schema (when `useCart === true`):
```js
const cartSchema = Yup.object().shape({
  cartDefault:        Yup.string().required('Plugin de carrinho é obrigatório'),
  unidadeId:          Yup.string().required('Id da loja é obrigatório'),
  statusId:           Yup.string().required('Id do status é obrigatório'),
  productFractionals: Yup.string().required('Produtos fracionados são obrigatórios'),
})
```

### Step 6 — PagarMe

```jsx
{step.id === 'pagarme' && (
  <>
    <YesNoGate
      label='Deseja integrar com o PagarMe?'
      isYes={usePagarMe}
      onChange={setUsePagarMe}
    />
    {usePagarMe && (
      <PagarMePanel
        values={formik.values}
        errors={formik.errors}
        touched={formik.touched}
        handleChange={formik.handleChange}
        handleBlur={formik.handleBlur}
        wizardMode={true}
      />
    )}
  </>
)}
```

Note: PagarMePanel includes an "Integrar com a Pagar.Me" action button which requires an
existing licensee ID. Pass `wizardMode={true}` prop to PagarMePanel so it can hide that
button. This requires a 1-line change to PagarMePanel — add `{ ..., wizardMode = false }` to
props and wrap the button with `{!wizardMode && (...)}`.

Yup schema (when `usePagarMe === true`):
```js
const pagarmeSchema = Yup.object().shape({
  financial_player_fee: Yup.string().required('Taxa é obrigatória'),
  holder_name:          Yup.string().required('Nome do titular é obrigatório'),
  holder_kind:          Yup.string().required('Tipo do titular é obrigatório'),
  holder_document:      Yup.string().required('Documento do titular é obrigatório'),
  bank:                 Yup.string().required('Banco é obrigatório'),
  branch_number:        Yup.string().required('Agência é obrigatória'),
  branch_check_digit:   Yup.string().required('Dígito da agência é obrigatório'),
  account_number:       Yup.string().required('Conta é obrigatória'),
  account_check_digit:  Yup.string().required('Dígito da conta é obrigatório'),
  account_type:         Yup.string().required('Tipo da conta é obrigatório'),
})
```

### Step 7 — Pedidos10 (only when currentUser.isPedidos10)

```jsx
{step.id === 'pedidos10' && (
  <>
    <YesNoGate
      label='Deseja integrar com o Pedidos10?'
      isYes={usePedidos10}
      onChange={setUsePedidos10}
    />
    {usePedidos10 && (
      <Pedidos10Panel
        values={formik.values}
        errors={formik.errors}
        touched={formik.touched}
        handleChange={formik.handleChange}
        handleBlur={formik.handleBlur}
        wizardMode={true}
      />
    )}
  </>
)}
```

Same `wizardMode` pattern for Pedidos10Panel to hide the "Assinar Webhook P10" button.

Yup schema (when `usePedidos10 === true`):
```js
const pedidos10Schema = Yup.object().shape({
  pedidos10_integrator:  Yup.string().required('Software integrador é obrigatório'),
  pedidos10_integration: Yup.string().required('Dados da integração são obrigatórios'),
})
```

### validateStep update

Replace the schemas map in `validateStep`:

```js
const schemas = {
  identity: identitySchema,
  // STEPS 2-7 ADDED IN task-04 ↓
  chat:      useChat                     ? chatSchema     : null,
  chatbot:   formik.values.useChatbot    ? chatbotSchema  : null,
  whatsapp:  useWhatsapp                 ? whatsappSchema : null,
  carrinho:  useCart                     ? cartSchema     : null,
  pagarme:   usePagarMe                  ? pagarmeSchema  : null,
  pedidos10: usePedidos10                ? pedidos10Schema: null,
}
```

Note: `validateStep` uses `formik` from closure — ensure it has access to `formik.values`.
The function is defined inside the `LicenseeWizard` component body where `formik` is
available from the Formik render prop callback. Adjust architecture if needed.

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Licensees/scenes/New/LicenseeWizard.js` | modify | Add Yes/No state vars, YesNoGate component, step schemas, step rendering for steps 2-7 |
| `client/src/pages/Licensees/scenes/Form/panels/PagarMePanel.js` | modify | Add `wizardMode` prop to hide action button |
| `client/src/pages/Licensees/scenes/Form/panels/Pedidos10Panel.js` | modify | Add `wizardMode` prop to hide action button |

### Do NOT Modify

- `client/src/pages/Licensees/scenes/New/index.js`
- `client/src/pages/Licensees/scenes/Form/index.js`
- `client/src/pages/Licensees/scenes/Form/panels/MainPanel.js`
- `client/src/pages/Licensees/scenes/Form/panels/ChatPanel.js`
- `client/src/pages/Licensees/scenes/Form/panels/ChatbotPanel.js`
- `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.js`
- `client/src/pages/Licensees/scenes/Form/panels/CartPanel.js`

## Conflict Avoidance Notes

task-05 also modifies `LicenseeWizard.js` (submit wiring only) — minimal overlap.
task-05 should branch from this task's branch.

## Implementation Steps

### Step 1: Add Yes/No state variables to LicenseeWizard component

### Step 2: Create YesNoGate helper (module level, above LicenseeWizard)

### Step 3: Add all 6 step schemas as module-level constants

### Step 4: Update validateStep schema dispatch map (at the marker)

### Step 5: Add step rendering for steps 2-7 (at the marker in step content div)

### Step 6: Add wizardMode prop to PagarMePanel and Pedidos10Panel

### Step 7: Verify

```bash
npx jest --testPathPatterns=Licensees --testPathIgnorePatterns=.claude/worktrees
npx eslint client/src/pages/Licensees/scenes/New/
npx eslint client/src/pages/Licensees/scenes/Form/panels/PagarMePanel.js
npx eslint client/src/pages/Licensees/scenes/Form/panels/Pedidos10Panel.js
```

## Testing

- [ ] Manual: Step 2 (Chat) — click Não → Próximo advances; click Sim → chatDefault required
- [ ] Manual: Step 3 (ChatBot) — Sim → useChatbot Formik field set to true
- [ ] Manual: Step 4 (WhatsApp) — Sim + baileys → only whatsappDefault required
- [ ] Manual: Step 6 (PagarMe) — Sim → fields shown, "Integrar" button hidden
- [ ] Manual: Step 7 (Pedidos10) — only shown when currentUser.isPedidos10
- [ ] `npx jest --testPathPatterns=New` — note results (full update in task-05)

## Documentation / KB Updates

None required at this stage.

## Completion Criteria

- [ ] Steps 2-7 each show a Yes/No gate
- [ ] Clicking Sim reveals relevant panel fields
- [ ] Clicking Não hides fields and allows Próximo without validation
- [ ] Per-step Yup schemas validate visible required fields
- [ ] Pedidos10 step absent when currentUser.isPedidos10 is false/undefined
- [ ] useChatbot Formik field set to true/false via Sim/Não
- [ ] PagarMePanel and Pedidos10Panel hide action buttons in wizardMode
- [ ] No ESLint errors
