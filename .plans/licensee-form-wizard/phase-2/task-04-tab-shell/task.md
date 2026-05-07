# Task: Tab Shell in Form/index.js

**Plan**: Licensee Form Wizard
**Task ID**: task-04
**Task Path**: phase-2/task-04-tab-shell
**Depends On**: phase-1/task-01-panel-general, phase-1/task-02-panel-comms, phase-1/task-03-panel-infra
**JIRA**: N/A

## Before You Start

- [ ] Confirm all Phase 1 tasks are `complete` or `adapted`
- [ ] Branch from task-03 (or main if all 3 were merged): `git switch plan/licensee-form-wizard/phase-1/task-03-panel-infra && git switch -c plan/licensee-form-wizard/phase-2/task-04-tab-shell`
- [ ] Read `Form/index.js` — at this point it should only render panel components

## Context

Add Bootstrap 5 Nav Tabs to `Form/index.js`. Six conditional tabs controlled by 6 question checkboxes in the MainPanel. All panes always mounted (CSS-driven).

### Question state to add in Form/index.js

```js
const [useChat, setUseChat] = useState(Boolean(initialValues?.chatDefault))
const [useWhatsapp, setUseWhatsapp] = useState(Boolean(initialValues?.whatsappDefault))
const [useCart, setUseCart] = useState(Boolean(initialValues?.cartDefault))
const [usePagarMe, setUsePagarMe] = useState(
  Boolean(initialValues?.holder_name || initialValues?.financial_player_fee !== '0.00')
)
```

Q2 (`useChatbot`) is already a Formik field — use `props.values.useChatbot` directly.
Q6 (Pedidos10) is `currentUser?.isPedidos10` — no extra state.

### Tab structure

```
activeTab: 'principal' | 'chat' | 'chatbot' | 'whatsapp' | 'carrinho' | 'pagarme' | 'pedidos10'
```

Default: `'principal'`

### Nav tabs rendering

Render the nav buttons first. Tab button visibility:
- Principal: always
- Chat: always (but only shown/meaningful when `useChat` is true; still show button so user can uncheck from main)
  → Actually: hide nav button when `!useChat`; auto-switch to `principal` when `useChat` becomes false
- ChatBot: hide when `!props.values.useChatbot`; auto-switch to `principal` when turned off
- WhatsApp: hide when `!useWhatsapp`
- Carrinho: hide when `!useCart`
- PagarMe: hide when `!usePagarMe`
- Pedidos10: hide when `!currentUser?.isPedidos10`

```jsx
// Nav button (always use type="button"):
<button
  type="button"
  className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
  onClick={() => setActiveTab('chat')}
>
  Chat
</button>
```

### Pane rendering

All panes always in DOM — CSS drives visibility:

```jsx
<div className={`tab-pane fade ${activeTab === 'chat' ? 'show active' : ''}`}>
  <ChatPanel ... />
</div>
```

### Auto-switch on question uncheck

Add a `useEffect` for each question:
```js
useEffect(() => {
  if (!useChat && activeTab === 'chat') setActiveTab('principal')
}, [useChat])
// similar for useChatbot, useWhatsapp, useCart, usePagarMe
```

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Licensees/scenes/Form/index.js` | modify | Add question state, activeTab state, Bootstrap Nav Tabs layout |

### Do NOT Modify

- Any `panels/*.js` files — layout only in this task

## Implementation Steps

### Step 1: Add state to Form/index.js

Inside `LicenseeForm`:
```js
const [activeTab, setActiveTab] = useState('principal')
const [useChat, setUseChat] = useState(Boolean(initialValues?.chatDefault))
const [useWhatsapp, setUseWhatsapp] = useState(Boolean(initialValues?.whatsappDefault))
const [useCart, setUseCart] = useState(Boolean(initialValues?.cartDefault))
const [usePagarMe, setUsePagarMe] = useState(
  Boolean(initialValues?.holder_name || (initialValues?.financial_player_fee && initialValues?.financial_player_fee !== '0.00'))
)
```

### Step 2: Add useEffect auto-switches

```js
useEffect(() => { if (!useChat && activeTab === 'chat') setActiveTab('principal') }, [useChat])
useEffect(() => { if (!props.values.useChatbot && activeTab === 'chatbot') setActiveTab('principal') }, [props.values.useChatbot])
useEffect(() => { if (!useWhatsapp && activeTab === 'whatsapp') setActiveTab('principal') }, [useWhatsapp])
useEffect(() => { if (!useCart && activeTab === 'carrinho') setActiveTab('principal') }, [useCart])
useEffect(() => { if (!usePagarMe && activeTab === 'pagarme') setActiveTab('principal') }, [usePagarMe])
```

Note: these effects must be inside the Formik render function where `props` is available, or extracted to a child component.

### Step 3: Wrap form content in Bootstrap Nav Tabs

```jsx
<ul className="nav nav-tabs mb-3">
  <li className="nav-item">
    <button type="button" className={`nav-link ${activeTab === 'principal' ? 'active' : ''}`} onClick={() => setActiveTab('principal')}>
      Principal
    </button>
  </li>
  {useChat && (
    <li className="nav-item">
      <button type="button" className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
        Chat
      </button>
    </li>
  )}
  {props.values.useChatbot && (
    <li className="nav-item">
      <button type="button" className={`nav-link ${activeTab === 'chatbot' ? 'active' : ''}`} onClick={() => setActiveTab('chatbot')}>
        ChatBot
      </button>
    </li>
  )}
  {useWhatsapp && (
    <li className="nav-item">
      <button type="button" className={`nav-link ${activeTab === 'whatsapp' ? 'active' : ''}`} onClick={() => setActiveTab('whatsapp')}>
        WhatsApp
      </button>
    </li>
  )}
  {useCart && (
    <li className="nav-item">
      <button type="button" className={`nav-link ${activeTab === 'carrinho' ? 'active' : ''}`} onClick={() => setActiveTab('carrinho')}>
        Carrinho de Compras
      </button>
    </li>
  )}
  {usePagarMe && (
    <li className="nav-item">
      <button type="button" className={`nav-link ${activeTab === 'pagarme' ? 'active' : ''}`} onClick={() => setActiveTab('pagarme')}>
        PagarMe
      </button>
    </li>
  )}
  {currentUser?.isPedidos10 && (
    <li className="nav-item">
      <button type="button" className={`nav-link ${activeTab === 'pedidos10' ? 'active' : ''}`} onClick={() => setActiveTab('pedidos10')}>
        Pedidos10
      </button>
    </li>
  )}
</ul>

<div className="tab-content">
  <div className={`tab-pane fade ${activeTab === 'principal' ? 'show active' : ''}`}>
    <MainPanel
      values={props.values}
      errors={errors}
      touched={props.touched}
      handleChange={props.handleChange}
      handleBlur={props.handleBlur}
      setFieldValue={props.setFieldValue}
      currentUser={currentUser}
      useChat={useChat} setUseChat={setUseChat}
      useWhatsapp={useWhatsapp} setUseWhatsapp={setUseWhatsapp}
      useCart={useCart} setUseCart={setUseCart}
      usePagarMe={usePagarMe} setUsePagarMe={setUsePagarMe}
    />
  </div>
  <div className={`tab-pane fade ${activeTab === 'chat' ? 'show active' : ''}`}>
    <ChatPanel values={props.values} errors={errors} touched={props.touched} handleChange={props.handleChange} handleBlur={props.handleBlur} />
  </div>
  <div className={`tab-pane fade ${activeTab === 'chatbot' ? 'show active' : ''}`}>
    <ChatbotPanel values={props.values} errors={errors} touched={props.touched} handleChange={props.handleChange} handleBlur={props.handleBlur} />
  </div>
  <div className={`tab-pane fade ${activeTab === 'whatsapp' ? 'show active' : ''}`}>
    <WhatsAppPanel values={props.values} errors={errors} touched={props.touched} handleChange={props.handleChange} handleBlur={props.handleBlur} />
  </div>
  <div className={`tab-pane fade ${activeTab === 'carrinho' ? 'show active' : ''}`}>
    <CartPanel values={props.values} errors={errors} touched={props.touched} handleChange={props.handleChange} handleBlur={props.handleBlur} />
  </div>
  <div className={`tab-pane fade ${activeTab === 'pagarme' ? 'show active' : ''}`}>
    <PagarMePanel values={props.values} errors={errors} touched={props.touched} handleChange={props.handleChange} handleBlur={props.handleBlur} />
  </div>
  <div className={`tab-pane fade ${activeTab === 'pedidos10' ? 'show active' : ''}`}>
    <Pedidos10Panel values={props.values} errors={errors} touched={props.touched} handleChange={props.handleChange} handleBlur={props.handleBlur} />
  </div>
</div>
```

### Step 4: Pass question props to MainPanel

MainPanel renders the 6 questions as checkboxes. Each checkbox's `onChange` updates the local state and resets the field value when unchecked (as specified in task-01).

## Testing

- [ ] Manual: open Create Licensee — verify only "Principal" tab shown; all 6 questions unchecked
- [ ] Manual: check "Integração com Plataforma de Chat?" → Chat tab appears; click it → Chat fields visible
- [ ] Manual: fill a chatbot field, switch tabs, submit → chatbot value saved
- [ ] Manual: open Edit Licensee that has chatDefault set → Chat tab visible on load
- [ ] Manual: uncheck a question while on that tab → auto-switch to Principal
- [ ] Manual: Baileys QR generation works on WhatsApp tab
- [ ] Run `npx jest --testPathPattern=Licensees` — all tests pass

## Documentation / KB Updates

After completion, run `document-solution` to capture the always-mounted pane pattern for future contributors.

## Completion Criteria

- [ ] Bootstrap Nav Tabs rendered; `activeTab` state drives active pane
- [ ] Nav tab buttons appear/disappear based on question checkboxes
- [ ] All panes always mounted — no `&&` on pane content
- [ ] Auto-switch to Principal when question is unchecked
- [ ] Edit licensee loads correct tab visibility from initialValues
- [ ] Submit saves all field values regardless of active tab
- [ ] All tests pass
- [ ] `npx eslint .` passes
