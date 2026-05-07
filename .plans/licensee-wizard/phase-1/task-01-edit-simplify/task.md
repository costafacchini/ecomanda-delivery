# Task: Edit Simplification — Remove Question Checkboxes

**Plan**: Licensee Create Wizard + Edit Simplification
**Task ID**: task-01
**Task Path**: phase-1/task-01-edit-simplify
**Depends On**: None (base from `plan/licensee-form-wizard/consolidated`)
**JIRA**: N/A

## Before You Start

- [ ] Checkout `plan/licensee-form-wizard/consolidated`
- [ ] Run `npx jest --testPathPatterns=Licensees --testPathIgnorePatterns=.claude/worktrees` — confirm all tests pass before touching anything
- [ ] Read `client/src/pages/Licensees/scenes/Form/panels/MainPanel.js` in full
- [ ] Read `client/src/pages/Licensees/scenes/Form/index.js` — identify 4 state vars passed to MainPanel: `useChat`, `useWhatsapp`, `useCart`, `usePagarMe` and their setters
- [ ] Read `client/src/pages/Licensees/scenes/Form/index.spec.js` — identify tests asserting on question checkbox labels

## Context

The licensee-form-wizard plan added 6 question checkboxes to `MainPanel.js` so users could
reveal tabs on the Edit form. Now that the wizard handles that gate for Create, the Edit form
can rely solely on `initialValues`-driven tab visibility (which `Form/index.js` already does
via its local state initialization). Removing the checkboxes simplifies MainPanel (presentational
only) and removes props that are no longer needed.

### What gets removed from MainPanel.js

Remove these 6 checkbox `<div className='row pb-2'>` blocks:
1. `questionUseChat` checkbox — "Integração com Plataforma de Chat?"
2. `useChatbot` checkbox — "Integração com Plataforma de ChatBot?"
3. `questionUseWhatsapp` checkbox — "Integração com Plataforma de WhatsApp?"
4. `questionUseCart` checkbox — "Integração com Carrinho de Compras?"
5. `questionUsePagarMe` checkbox — "Integração com PagarMe?"
6. `questionUsePedidos10` display block — read-only Pedidos10 indicator

Remove from props destructuring:
```js
// REMOVE:
useChat, setUseChat,
useWhatsapp, setUseWhatsapp,
useCart, setUseCart,
usePagarMe, setUsePagarMe,
setFieldValue,
```

### What gets removed from Form/index.js

Stop passing the 9 question props to `<MainPanel>`. The 4 local `useState` variables and
their `useEffect` auto-switches are **kept** — they still control nav tab visibility.

```jsx
// REMOVE these from the <MainPanel .../> call:
useChat={useChat}
setUseChat={setUseChat}
useWhatsapp={useWhatsapp}
setUseWhatsapp={setUseWhatsapp}
useCart={useCart}
setUseCart={setUseCart}
usePagarMe={usePagarMe}
setUsePagarMe={setUsePagarMe}
setFieldValue={props.setFieldValue}
```

Keep: `values`, `errors`, `touched`, `handleChange`, `handleBlur`, `currentUser`.

### What does NOT change

- The 4 local state variables in `Form/index.js` (`useChat`, `useWhatsapp`, `useCart`, `usePagarMe`) — still drive nav tab visibility
- The `useEffect` auto-switch blocks in `Form/index.js` — kept as-is
- Tab nav rendering in `Form/index.js` — unchanged
- All panel files other than `MainPanel.js` — untouched
- `useChatbot` in `licenseeInitialValues` — kept (Formik field; just no longer has a visible checkbox in MainPanel)

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Licensees/scenes/Form/panels/MainPanel.js` | modify | Remove 6 question blocks + question props from signature |
| `client/src/pages/Licensees/scenes/Form/index.js` | modify | Stop passing question props to MainPanel |
| `client/src/pages/Licensees/scenes/Form/index.spec.js` | modify | Remove assertions on question checkbox labels |

### Do NOT Modify

- `client/src/pages/Licensees/scenes/New/index.js`
- `client/src/pages/Licensees/scenes/New/index.spec.js`
- Any other `panels/*.js` file

## Conflict Avoidance Notes

Phase 1 — no parallel tasks. All subsequent tasks chain from this branch.

## Implementation Steps

### Step 1: Update MainPanel.js

Remove the 6 question checkbox `<div className='row pb-2'>` blocks.

Remove from props destructuring: `useChat`, `setUseChat`, `useWhatsapp`, `setUseWhatsapp`,
`useCart`, `setUseCart`, `usePagarMe`, `setUsePagarMe`, `setFieldValue`.

### Step 2: Update Form/index.js

Find the `<MainPanel` JSX and remove the 9 question props listed above.

### Step 3: Update Form/index.spec.js

Remove assertions referencing question checkbox labels:
- `'Integração com Plataforma de Chat?'`
- `'Integração com Plataforma de ChatBot?'`
- `'Integração com Plataforma de WhatsApp?'`
- `'Integração com Carrinho de Compras?'`
- `'Integração com PagarMe?'`

For any test that checked tab visibility by toggling a checkbox, replace with assertions based
on `initialValues` (e.g., render with `chatDefault: 'rocketchat'` → Chat tab visible).

### Step 4: Verify

```bash
npx jest --testPathPatterns=Licensees --testPathIgnorePatterns=.claude/worktrees
npx eslint client/src/pages/Licensees/scenes/Form/
```

## Testing

- [ ] `npx jest --testPathPatterns=Licensees` — all pass
- [ ] Manual: Edit Licensee — no question checkboxes on Principal tab
- [ ] Manual: Edit licensee with chatDefault set → Chat tab still appears
- [ ] Manual: Edit licensee with no chatDefault → Chat tab not shown
- [ ] `npx eslint .` passes

## Documentation / KB Updates

No KB updates required.

## Completion Criteria

- [ ] MainPanel.js has no question checkbox blocks
- [ ] MainPanel.js props signature does not include question state props
- [ ] Form/index.js MainPanel call has no question state props
- [ ] Form/index.spec.js has no assertions on question checkbox labels
- [ ] All tests pass
- [ ] ESLint passes
