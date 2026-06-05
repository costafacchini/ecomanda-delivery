# Task: Onboarding Modal Component

**Plan**: Onboarding Wizard
**Phase**: 2
**Task ID (phase-local)**: task-02
**Task Path**: phase-2/task-02-onboarding-modal
**Depends On**: phase-1/task-01-backend-onboarding-endpoint
**JIRA**: N/A

## Objective

Create `OnboardingModal.tsx` — a two-step Formik wizard rendered as a Bootstrap modal over the login page gradient background — and `onboarding.ts` — the frontend service that calls `POST /onboarding`. The modal receives `isOpen` and `onClose`/`onSuccess` props from its parent; it owns all form state internally.

## Context

**Modal pattern in this codebase**: Raw HTML with Bootstrap CSS classes — no react-bootstrap library. See `client/src/components/SelectLicenseeModal/index.tsx` (lines 12–41) and `client/src/pages/Dashboard/cards/FailedMessagesModal.tsx` (lines 54–117). Key pattern: `if (!isOpen) return null`; use `d-block` + `modal fade show`; overlay with `rgba(0,0,0,0.5)`.

**Wizard pattern**: See `client/src/pages/Licensees/scenes/New/LicenseeWizard.tsx`. Uses Formik with per-step Yup validation schemas and a `currentStep` state integer. Step validation (`validateForm()` or Yup `validate`) runs before advancing.

**Frontend service pattern**: See `client/src/services/licensee.ts`. Uses `api()` wrapper from `../../services/api`. The onboarding endpoint is public so no `x-access-token` header is needed.

**Backend request body (flat fields, from task-01)**:
```json
{
  "licenseeName": "string",
  "kind": "individual|company",
  "document": "string",
  "licenseeEmail": "string",
  "phone": "string",
  "userName": "string",
  "userEmail": "string",
  "password": "string"
}
```
`licenseKind` is NOT sent — the backend forces `'demo'`.

**Wizard steps**:
- Step 1 — Licensee: `licenseeName`, `kind` (select: individual/company), `document`, `licenseeEmail`, `phone`
- Step 2 — User: `userName`, `userEmail`, `password`, `confirmPassword` (confirmPassword is frontend-only; strip before submit)

**Success flow**: on 201 → call `onSuccess()` prop (parent handles redirect/banner). On error → display `response.data.message` inline in the modal footer.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify task-01 status.md shows `complete`
- [ ] Read `client/src/components/SelectLicenseeModal/index.tsx` — note exact Bootstrap classes
- [ ] Read `client/src/pages/Licensees/scenes/New/LicenseeWizard.tsx` lines 65–264 — note Formik + Yup step validation pattern
- [ ] Read `client/src/services/licensee.ts` — note `api()` wrapper and header pattern
- [ ] Read `client/src/services/licensee.spec.ts` lines 1–50 — note Vitest mock pattern (`vi.mock`, `apiModule.default.mockReturnValue`)
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/SignIn/OnboardingModal.tsx` | create | Two-step wizard modal component |
| `client/src/services/onboarding.ts` | create | `createAccount(fields)` function; calls `POST /onboarding` |
| `client/src/services/onboarding.spec.ts` | create | Vitest tests mirroring `licensee.spec.ts` structure |

### Do NOT Modify

- `client/src/pages/SignIn/index.tsx` — owned by phase-3/task-03-signin-integration
- `client/src/services/licensee.ts` — reference only, do not modify

## Implementation Steps

### Step 1: Create `onboarding.ts` service

Create `client/src/services/onboarding.ts`.

```ts
// Call public POST /onboarding — no auth token required
export async function createAccount(fields: OnboardingFields) {
  const response = await api().post('/onboarding', { body: fields })
  return response
}
```

Define an `OnboardingFields` interface matching the flat request body shape.

### Step 2: Create `onboarding.spec.ts`

Create `client/src/services/onboarding.spec.ts`.

Mirror the pattern in `licensee.spec.ts`:
- `vi.mock('./api')`; mock `apiModule.default.mockReturnValue({ post: mockPost })`
- Test: `createAccount(fields)` calls `POST /onboarding` with correct body
- Test: no `x-access-token` header is sent (service should not call `getToken`)

### Step 3: Create `OnboardingModal.tsx`

Create `client/src/pages/SignIn/OnboardingModal.tsx`.

**Structure**:
```tsx
interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}
```

**Modal skeleton** (follow SelectLicenseeModal pattern):
```tsx
if (!isOpen) return null
return (
  <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <div className="modal-content">
        <div className="modal-header">...</div>
        <div className="modal-body">...</div>
        <div className="modal-footer">...</div>
      </div>
    </div>
  </div>
)
```

**Formik setup**:
- Single `useFormik` instance wrapping both steps
- Initial values: all fields as empty strings
- `currentStep` state: `useState(1)`
- Validation: two Yup schemas (step-1 and step-2); validate only the current step's fields before advancing
- `onSubmit`: call `createAccount(strippedFields)` (omit `confirmPassword`); call `onSuccess()` on 201; set inline error on failure

**Step 1 fields** (in the modal body when `currentStep === 1`):
- `licenseeName` — text, label "Nome da empresa"
- `kind` — select: `''` (select…) / `individual` (Pessoa Física) / `company` (Empresa)
- `document` — text, label "CPF / CNPJ"
- `licenseeEmail` — email, label "Email da empresa"
- `phone` — text, label "Telefone"

**Step 2 fields** (in the modal body when `currentStep === 2`):
- `userName` — text, label "Seu nome"
- `userEmail` — email, label "Seu email"
- `password` — password, label "Senha" (min 8 chars)
- `confirmPassword` — password, label "Confirmar senha"

**Footer**:
- Step 1: "Próximo" button (validates step-1 then advances) + "Cancelar" (calls `onClose`)
- Step 2: "Anterior" button (goes back to step 1) + "Criar conta" submit button
- Error message displayed above buttons when present

**Step indicator**: Simple "Passo 1 de 2" / "Passo 2 de 2" text in the modal header subtitle.

## Testing

- [ ] `onboarding.spec.ts` passes: correct POST URL, no auth header sent
- [ ] Manual: open modal, fill step 1, click Próximo — form only advances when all step-1 fields are valid
- [ ] Manual: click Anterior on step 2 — goes back with values preserved
- [ ] Manual: submit with duplicate email — inline error displayed
- [ ] `npx vitest run client/src/services/onboarding.spec.ts` passes
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required — pattern mirrors existing modals and services; nothing non-obvious introduced

## Completion Criteria

- [ ] `OnboardingModal.tsx` renders a two-step wizard in a Bootstrap modal
- [ ] `onboarding.ts` calls the correct endpoint without an auth token
- [ ] Formik validation blocks step advancement when fields are invalid
- [ ] Error from API displayed inline in modal footer
- [ ] All new specs pass
- [ ] `pre-commit-check` passes
- [ ] Changes committed to `plan/onboarding-wizard/phase-2/task-02-onboarding-modal`
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

No parallel tasks in this phase.
