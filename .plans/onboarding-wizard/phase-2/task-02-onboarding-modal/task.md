# Task: Onboarding Modal Component

**Plan**: Onboarding Wizard
**Phase**: 2
**Task ID (phase-local)**: task-02
**Task Path**: phase-2/task-02-onboarding-modal
**Depends On**: phase-1/task-01-backend-onboarding-endpoint
**JIRA**: N/A

## Objective

Create `OnboardingModal.tsx` — a dynamic multi-step Formik wizard rendered as a Bootstrap modal over the login gradient — and `onboarding.ts` — the frontend service that calls `POST /onboarding`. Step sequence adjusts at runtime based on integration choices (chat/WhatsApp); the last step always collects user credentials.

## Context

**Modal pattern**: Raw Bootstrap HTML, no react-bootstrap. See `client/src/components/SelectLicenseeModal/index.tsx` (lines 12–41). Key: `if (!isOpen) return null`; `className="modal d-block"` + `backgroundColor: 'rgba(0,0,0,0.5)'` overlay.

**YesNoGate component**: Already exists in `LicenseeWizard.tsx` (lines 204–226). Copy it directly — do not import from the wizard.

**Step progression (dynamic)**:
```ts
type StepId = 'identity' | 'integrations' | 'chat' | 'whatsapp' | 'user'

function buildSteps(wantsChat: boolean | null, wantsWhatsapp: boolean | null): StepId[] {
  return [
    'identity',
    'integrations',
    ...(wantsChat  === true ? ['chat'     as StepId] : []),
    ...(wantsWhatsapp === true ? ['whatsapp' as StepId] : []),
    'user',
  ]
}
```
Recompute whenever `wantsChat` or `wantsWhatsapp` changes. `currentStepIndex` always stays within bounds after recomputation (the "integrations" step is never skipped so no index gap can occur mid-wizard).

**Chat fields** (from `ChatPanel.tsx`): `chatDefault` (select: rocketchat/crisp/cuboup/chatwoot/local), `chatUrl`, `chatIdentifier` (required for crisp/chatwoot), `chatKey` (required for crisp/chatwoot).

**WhatsApp fields** (from `WhatsAppPanel.tsx`): `whatsappDefault` (select: utalk/dialog/ycloud/pabbly/baileys), `whatsappToken` (required unless baileys), `whatsappUrl` (required unless baileys).

**Frontend service**: Public endpoint — no `x-access-token` header. Pattern: `api().post('/onboarding', { body: fields })`.

**Request body sent on submit**: flat object; omit `confirmPassword`; omit chat fields if `wantsChat !== true`; omit WhatsApp fields if `wantsWhatsapp !== true`.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`; branch `plan/onboarding-wizard/phase-2/task-02-onboarding-modal`
- [ ] Verify task-01 `status.md` shows `complete`
- [ ] Read `client/src/components/SelectLicenseeModal/index.tsx` — note exact Bootstrap classes
- [ ] Read `client/src/pages/Licensees/scenes/New/LicenseeWizard.tsx` lines 204–264 — note `YesNoGate` and `validateStep` pattern
- [ ] Read `client/src/pages/Licensees/scenes/Form/panels/ChatPanel.tsx` — note field set
- [ ] Read `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.tsx` — note field set
- [ ] Read `client/src/services/licensee.ts` — note `api()` wrapper usage
- [ ] Read `client/src/services/licensee.spec.ts` lines 1–50 — note Vitest mock pattern
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/SignIn/OnboardingModal.tsx` | create | Full dynamic wizard modal |
| `client/src/services/onboarding.ts` | create | `createAccount(fields)` — calls `POST /onboarding` |
| `client/src/services/onboarding.spec.ts` | create | Vitest tests for the service |

### Do NOT Modify

- `client/src/pages/SignIn/index.tsx` — owned by phase-3/task-03-signin-integration
- `client/src/services/licensee.ts` — reference only
- `client/src/pages/Licensees/scenes/Form/panels/ChatPanel.tsx` — reference only
- `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.tsx` — reference only

## Implementation Steps

### Step 1: Create `onboarding.ts` service

```ts
import api from './api'

export interface OnboardingFields {
  licenseeName: string
  kind: string
  document: string
  licenseeEmail: string
  phone: string
  chatDefault?: string
  chatUrl?: string
  chatIdentifier?: string
  chatKey?: string
  whatsappDefault?: string
  whatsappToken?: string
  whatsappUrl?: string
  userName: string
  userEmail: string
  password: string
}

export async function createAccount(fields: OnboardingFields) {
  return api().post('/onboarding', { body: fields })
}
```

No auth header — the endpoint is public.

### Step 2: Create `onboarding.spec.ts`

Mirror `licensee.spec.ts` structure:
- `vi.mock('./api')`; `vi.mock('./auth')` (so no accidental token import)
- Test: `createAccount(fields)` calls `api().post('/onboarding', { body: fields })`
- Test: no `x-access-token` header is passed

### Step 3: Create `OnboardingModal.tsx`

**Props interface**:
```tsx
interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}
```

**State**:
```tsx
const [currentStepIndex, setCurrentStepIndex] = useState(0)
const [wantsChat, setWantsChat]         = useState<boolean | null>(null)
const [wantsWhatsapp, setWantsWhatsapp] = useState<boolean | null>(null)
const [stepErrors, setStepErrors]       = useState<string[] | null>(null)
const [submitError, setSubmitError]     = useState('')
```

**Step sequence**: use `buildSteps(wantsChat, wantsWhatsapp)` (see Context). Always recompute from state.

**Formik initial values**:
```ts
{
  licenseeName: '', kind: '', document: '', licenseeEmail: '', phone: '',
  chatDefault: '', chatUrl: '', chatIdentifier: '', chatKey: '',
  whatsappDefault: '', whatsappToken: '', whatsappUrl: '',
  userName: '', userEmail: '', password: '', confirmPassword: '',
}
```

**Yup schemas per step**:
- `identity`: licenseeName required, licenseeEmail isEmail, phone/document/kind required
- `integrations`: no validation (YesNo gates are not Formik fields)
- `chat`: chatDefault required, chatUrl required; chatIdentifier/chatKey required when chatDefault is 'crisp'/'chatwoot'
- `whatsapp`: whatsappDefault required; whatsappToken/whatsappUrl required when whatsappDefault is not 'baileys'
- `user`: userName required (min 4), userEmail isEmail, password min(8), confirmPassword must match password

**`validateCurrentStep` helper**:
```ts
async function validateCurrentStep(values: any): Promise<boolean> {
  const stepId = buildSteps(wantsChat, wantsWhatsapp)[currentStepIndex]
  const schema = schemaMap[stepId]
  if (!schema) return true  // integrations step has no Yup schema
  try {
    await schema.validate(values, { abortEarly: false })
    setStepErrors(null)
    return true
  } catch (err: any) {
    setStepErrors(err.errors)
    return false
  }
}
```

**`handleNext`**:
1. Validate current step
2. If valid: `setStepErrors(null); setCurrentStepIndex(i => i + 1)`

**`handleBack`**:
- `setStepErrors(null); setCurrentStepIndex(i => i - 1)`

**Formik `onSubmit`** (only called when on the last step):
```ts
async function handleSubmit(values: any) {
  const valid = await validateCurrentStep(values)
  if (!valid) return

  const payload: OnboardingFields = {
    licenseeName: values.licenseeName,
    kind: values.kind,
    document: values.document,
    licenseeEmail: values.licenseeEmail,
    phone: values.phone,
    userName: values.userName,
    userEmail: values.userEmail,
    password: values.password,
    ...(wantsChat ? {
      chatDefault: values.chatDefault,
      chatUrl: values.chatUrl,
      chatIdentifier: values.chatIdentifier,
      chatKey: values.chatKey,
    } : {}),
    ...(wantsWhatsapp ? {
      whatsappDefault: values.whatsappDefault,
      whatsappToken: values.whatsappToken,
      whatsappUrl: values.whatsappUrl,
    } : {}),
  }

  const response = await createAccount(payload)
  if (response.status === 201) {
    onSuccess()
  } else {
    setSubmitError(response.data?.message || 'Erro ao criar conta')
  }
}
```

**Modal JSX skeleton**:
```tsx
if (!isOpen) return null
const steps = buildSteps(wantsChat, wantsWhatsapp)
const stepId = steps[currentStepIndex]
const isLast = currentStepIndex === steps.length - 1

return (
  <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Criar conta</h5>
          <p className="text-muted mb-0 ms-2 small">Passo {currentStepIndex + 1} de {steps.length}</p>
          <button type="button" className="btn-close" onClick={onClose} />
        </div>
        <div className="modal-body">
          {/* render step content based on stepId */}
        </div>
        <div className="modal-footer flex-column align-items-stretch">
          {(stepErrors || submitError) && (
            <div className="alert alert-danger mb-2">
              {stepErrors?.map(e => <div key={e}>{e}</div>)}
              {submitError && <div>{submitError}</div>}
            </div>
          )}
          <div className="d-flex justify-content-between">
            {currentStepIndex === 0
              ? <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              : <button className="btn btn-outline-secondary" onClick={handleBack}>← Voltar</button>
            }
            {isLast
              ? <button className="btn btn-success" onClick={() => formik.submitForm()}>Criar conta</button>
              : <button className="btn btn-primary" onClick={() => handleNext(formik.values)}>Próximo →</button>
            }
          </div>
        </div>
      </div>
    </div>
  </div>
)
```

**Step content per `stepId`**:

- `identity`: render five form fields (licenseeName, kind select, document, licenseeEmail, phone) using Bootstrap form classes (no `FieldWithError` — that component is for the admin area)
- `integrations`: render two `YesNoGate` blocks stacked — one for chat, one for WhatsApp; update `wantsChat`/`wantsWhatsapp` state via `onChange`
- `chat`: render chatDefault select (rocketchat/crisp/cuboup/chatwoot/local), chatUrl text; conditionally render chatIdentifier and chatKey when chatDefault is 'crisp' or 'chatwoot'
- `whatsapp`: render whatsappDefault select (utalk/dialog/ycloud/pabbly/baileys), whatsappToken and whatsappUrl inputs conditionally hidden when whatsappDefault is 'baileys'
- `user`: render userName, userEmail, password (type=password), confirmPassword (type=password)

All inputs use `formik.values`, `formik.handleChange`, `formik.handleBlur`. Display inline `text-danger small` messages for field-level errors from `formik.errors` where available.

**`YesNoGate`** (copy from LicenseeWizard — do not import):
```tsx
function YesNoGate({ label, isYes, onChange }: { label: string; isYes: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="mb-3">
      <p className="fw-semibold">{label}</p>
      <div className="btn-group" role="group">
        <button type="button" className={`btn ${isYes === true ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => onChange(true)}>Sim</button>
        <button type="button" className={`btn ${isYes === false ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => onChange(false)}>Não</button>
      </div>
    </div>
  )
}
```

## Testing

- [ ] `onboarding.spec.ts` passes: correct POST URL, no auth header
- [ ] Manual: open modal; fill identity step; "Próximo" blocked when any required field is empty
- [ ] Manual: integrations step — choose "Sim" for chat only → chat step appears; whatsapp step is skipped; user step is last
- [ ] Manual: integrations step — choose "Não" for both → jumps directly to user step
- [ ] Manual: "← Voltar" on user step returns to integrations step (or chat/whatsapp if chosen)
- [ ] Manual: submit with duplicate email → inline submit error displayed
- [ ] Manual: happy path end-to-end → `onSuccess()` called (parent handles banner)
- [ ] `npx vitest run client/src/services/onboarding.spec.ts` passes
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required — pattern mirrors existing modals and services

## Completion Criteria

- [ ] `OnboardingModal.tsx` renders a dynamic step wizard; integration steps appear/skip based on yes/no choices
- [ ] `onboarding.ts` calls the correct endpoint without an auth token
- [ ] Formik validation blocks step advancement when fields are invalid; integration step passes immediately
- [ ] Error from API displayed inline in modal footer
- [ ] All new specs pass
- [ ] `pre-commit-check` passes
- [ ] Changes committed to `plan/onboarding-wizard/phase-2/task-02-onboarding-modal`
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

No parallel tasks in this phase.
