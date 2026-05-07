# Task: Wizard Submit + Full Test Coverage

**Plan**: Licensee Create Wizard + Edit Simplification
**Task ID**: task-05
**Task Path**: phase-4/task-05-wizard-submit
**Depends On**: phase-3/task-04-step-integrations (branch from task-04)
**JIRA**: N/A

## Before You Start

- [ ] Confirm `phase-3/task-04-step-integrations` is `complete`
- [ ] Branch from task-04: `git switch plan/licensee-wizard/phase-3/task-04-step-integrations && git switch -c plan/licensee-wizard/phase-4/task-05-wizard-submit`
- [ ] Run `npx jest --testPathPatterns=Licensees --testPathIgnorePatterns=.claude/worktrees` — note current failures
- [ ] Read `New/index.js` — how `onSubmit` and `errors` are passed to LicenseeWizard
- [ ] Read `New/index.spec.js` — understand existing test structure
- [ ] Read `Form/index.spec.js` — identify remaining question checkbox label assertions

## Context

Wire up payload cleanup before calling `onSubmit`, ensure backend errors display correctly,
then rewrite `New/index.spec.js` for the multi-step wizard and clean up `Form/index.spec.js`.

### Payload cleanup

Before calling `onSubmit(values)`, strip fields belonging to "No" steps so the backend
doesn't receive partial data. Add inside the Formik `onSubmit` callback in `LicenseeWizard.js`:

```js
onSubmit={(values) => {
  const cleaned = { ...values }
  if (!useChat) {
    cleaned.chatDefault = ''
    cleaned.chatUrl = ''
    cleaned.chatIdentifier = ''
    cleaned.chatKey = ''
    cleaned.useSenderName = false
  }
  if (!values.useChatbot) {
    cleaned.chatbotDefault = ''
    cleaned.chatbotUrl = ''
    cleaned.chatbotAuthorizationToken = ''
    cleaned.chatbotApiToken = ''
    cleaned.messageOnResetChatbot = ''
    cleaned.messageOnCloseChat = ''
  }
  if (!useWhatsapp) {
    cleaned.whatsappDefault = ''
    cleaned.whatsappToken = ''
    cleaned.whatsappUrl = ''
    cleaned.useFileIDYcloud = false
  }
  if (!useCart) {
    cleaned.cartDefault = ''
    cleaned.unidadeId = ''
    cleaned.statusId = ''
    cleaned.productFractionals = ''
  }
  if (!usePagarMe) {
    cleaned.financial_player_fee = '0.00'
    cleaned.holder_name = ''
    cleaned.holder_kind = ''
    cleaned.holder_document = ''
    cleaned.bank = ''
    cleaned.branch_number = ''
    cleaned.branch_check_digit = ''
    cleaned.account_number = ''
    cleaned.account_check_digit = ''
    cleaned.account_type = ''
  }
  if (!usePedidos10) {
    cleaned.pedidos10_integrator = ''
    cleaned.pedidos10_integration = ''
  }
  onSubmit(cleaned)
}}
```

### Backend error display

The error block in LicenseeWizard already shows `backendErrors` and `stepErrors`. Verify
`backendErrors` renders correctly using the shape returned by the API (check `New/index.spec.js`
for the existing mock error format — usually `[{ message: '...' }]` or `['...']`).

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Licensees/scenes/New/LicenseeWizard.js` | modify | Add payload cleanup in Formik onSubmit |
| `client/src/pages/Licensees/scenes/New/index.spec.js` | rewrite | Multi-step wizard tests |
| `client/src/pages/Licensees/scenes/Form/index.spec.js` | modify | Remove remaining question checkbox assertions |

### Do NOT Modify

- `client/src/pages/Licensees/scenes/New/index.js`
- `client/src/pages/Licensees/scenes/Form/index.js`
- Any panel file

## Conflict Avoidance Notes

Final task — no parallel conflicts.

## Implementation Steps

### Step 1: Add payload cleanup to LicenseeWizard.js

### Step 2: Rewrite New/index.spec.js

Create helpers to navigate through wizard steps:

```js
async function fillIdentityStep() {
  fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Test Licensee' } })
  fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'company' } })
  fireEvent.change(screen.getByLabelText('Documento'), { target: { value: '12345678901234' } })
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'test@test.com' } })
  // licenseKind has default 'demo' — already valid
  fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '48999999999' } })
}

async function clickNext() {
  fireEvent.click(screen.getByRole('button', { name: 'Próximo →' }))
  await waitFor(() => {}) // allow state update
}

async function advanceAllIntegrationStepsAsNo() {
  // For steps 2-6 (or 2-7 if isPedidos10): click Próximo without selecting Sim
  const integrationStepCount = /* depends on currentUser.isPedidos10 */ 5
  for (let i = 0; i < integrationStepCount; i++) {
    await clickNext()
  }
}
```

**Required test cases** (follow existing test file patterns):

1. `'renders the wizard with Identity step on mount'` — 6 identity fields visible
2. `'shows validation errors on Step 1 when Next clicked with empty fields'` — errors appear, no advance
3. `'advances to Chat step after filling required Identity fields'`
4. `'shows Chat panel fields when Sim is selected on Chat step'`
5. `'does not show Chat fields when Não is selected'`
6. `'creates a new licensee when all integration steps are answered with Não'` — happy path, all-default payload
7. `'creates a new licensee with Chat data when Chat step Sim is selected'`
8. `'renders backend errors on last step when creation fails'`
9. `'Cancel navigates to /licensees from Step 1'`
10. `'Voltar from Step 2 returns to Step 1 with values preserved'`

Use `vi.mock` (Vitest) pattern matching the existing `New/index.spec.js` mocks for
`createLicensee`, `useNavigate`, `toast`.

### Step 3: Update Form/index.spec.js

Read the file and remove any remaining assertions about question checkbox labels:
- Remove `getByLabelText('Integração com Plataforma de ChatBot?')` calls
- For tests that toggled a checkbox to verify tab visibility, replace with:
  `render(<Form initialValues={{ ...defaults, chatDefault: 'rocketchat' }} .../>)` →
  Chat tab visible; `render(<Form initialValues={defaults} .../>)` → Chat tab not visible

### Step 4: Run full test suite

```bash
npx jest --testPathPatterns=Licensees --testPathIgnorePatterns=.claude/worktrees
npx eslint client/src/pages/Licensees/
```

All tests must pass.

## Testing

- [ ] `npx jest --testPathPatterns=Licensees --testPathIgnorePatterns=.claude/worktrees` — ALL pass
- [ ] Manual: full wizard happy path — Identity filled, all integrations Não → Salvar → redirects to listing
- [ ] Manual: wizard with Chat Sim — fill chatDefault + chatUrl → Salvar → created with chat fields
- [ ] Manual: backend error (mock 422) → error shown on last step
- [ ] Manual: Cancel from step 3 → navigates to /licensees
- [ ] `npx eslint .` passes

## Documentation / KB Updates

After completion, run `document-solution` to capture the multi-step wizard pattern
(Formik + per-step Yup validation + Yes/No gates) as a reusable KB entry.

## Completion Criteria

- [ ] LicenseeWizard.js cleans payload before onSubmit (No-step fields zeroed)
- [ ] Backend errors from New/index.js are displayed on last step
- [ ] New/index.spec.js covers: mount, step validation, Yes/No step, happy path, error path, Cancel, Voltar
- [ ] Form/index.spec.js has no assertions on question checkbox labels
- [ ] All Licensee tests pass
- [ ] ESLint passes
