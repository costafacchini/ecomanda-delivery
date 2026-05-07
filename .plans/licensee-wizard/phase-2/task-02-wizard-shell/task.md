# Task: Wizard Shell

**Plan**: Licensee Create Wizard + Edit Simplification
**Task ID**: task-02
**Task Path**: phase-2/task-02-wizard-shell
**Depends On**: phase-1/task-01-edit-simplify
**JIRA**: N/A

## Before You Start

- [ ] Confirm `phase-1/task-01-edit-simplify` is `complete`
- [ ] Branch from task-01: `git switch plan/licensee-wizard/phase-1/task-01-edit-simplify && git switch -c plan/licensee-wizard/phase-2/task-02-wizard-shell`
- [ ] Run `npx jest --testPathPatterns=Licensees --testPathIgnorePatterns=.claude/worktrees` — all pass
- [ ] Read `client/src/pages/Licensees/scenes/New/index.js` — understand current structure
- [ ] Read `client/src/pages/Licensees/scenes/Form/index.js` — note `licenseeInitialValues` to copy

## Context

Create `LicenseeWizard.js` — a full-page multi-step wizard shell with placeholder step
content. Update `New/index.js` to render it instead of the generic `<Form>`.

The shell establishes:
- Step configuration array (7 steps with id, title, pedidos10Only flag)
- `currentStep` state (0-indexed)
- Bootstrap 5 progress bar
- Navigation: Cancel → `/licensees`, Back, Next, Save (last step only)
- `validateStep` placeholder (returns true — replaced in task-03/04)
- Single Formik instance wrapping the entire wizard

### Step configuration

```js
const STEPS = [
  { id: 'identity',  title: 'Identidade', pedidos10Only: false },
  { id: 'chat',      title: 'Chat',        pedidos10Only: false },
  { id: 'chatbot',   title: 'ChatBot',     pedidos10Only: false },
  { id: 'whatsapp',  title: 'WhatsApp',    pedidos10Only: false },
  { id: 'carrinho',  title: 'Carrinho',    pedidos10Only: false },
  { id: 'pagarme',   title: 'PagarMe',     pedidos10Only: false },
  { id: 'pedidos10', title: 'Pedidos10',   pedidos10Only: true  },
]
```

Effective steps: `STEPS.filter(s => !s.pedidos10Only || currentUser?.isPedidos10)`.

### Layout

```
┌─────────────────────────────────────────────────────┐
│  Criar Licenciado                                    │
│  Passo N de M — [Step Title]                         │
│  ──────────────────────── (progress bar)             │
│                                                      │
│  [Step content placeholder]                          │
│                                                      │
│  [Cancelar]      [← Voltar]  [Próximo →] / [Salvar] │
└─────────────────────────────────────────────────────┘
```

Nav: Cancel always left; Back+Next/Save always right. Back hidden on step 0.
Salvar visible only on last step; Próximo on all other steps.

### New/index.js changes

`New/index.js` currently renders `<Form>` from `Form/index.js`. Replace with:
- Import `LicenseeWizard`
- Pass `currentUser`, `onSubmit` handler
- `onSubmit` calls `createLicensee(values)` → 201: toast.success + navigate('/licensees'); else: setErrors + toast.error
- Pass `errors` (backend errors state) to LicenseeWizard so it can render them on last step

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Licensees/scenes/New/LicenseeWizard.js` | create | Wizard shell component |
| `client/src/pages/Licensees/scenes/New/index.js` | modify | Render LicenseeWizard instead of Form |

### Do NOT Modify

- `client/src/pages/Licensees/scenes/Form/index.js`
- `client/src/pages/Licensees/scenes/Form/panels/MainPanel.js`
- Any panel file
- `client/src/pages/Licensees/scenes/New/index.spec.js` — tests updated in task-05

## Conflict Avoidance Notes

Phase 3 tasks (task-03 and task-04) both modify `LicenseeWizard.js`. To avoid conflicts,
task-04 must branch from task-03 (not from task-02). Both tasks are sequential within Phase 3.

## Implementation Steps

### Step 1: Copy licenseeInitialValues

Copy `licenseeInitialValues` from `Form/index.js` into `LicenseeWizard.js` as a module-level
constant. Do NOT import from `Form/index.js` (not exported). Keep all fields.

### Step 2: Create LicenseeWizard.js

```js
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { FieldWithError } from '../../../../components/form'

const licenseeInitialValues = { /* copy from Form/index.js */ }

const STEPS = [
  { id: 'identity',  title: 'Identidade', pedidos10Only: false },
  { id: 'chat',      title: 'Chat',        pedidos10Only: false },
  { id: 'chatbot',   title: 'ChatBot',     pedidos10Only: false },
  { id: 'whatsapp',  title: 'WhatsApp',    pedidos10Only: false },
  { id: 'carrinho',  title: 'Carrinho',    pedidos10Only: false },
  { id: 'pagarme',   title: 'PagarMe',     pedidos10Only: false },
  { id: 'pedidos10', title: 'Pedidos10',   pedidos10Only: true  },
]

function LicenseeWizard({ currentUser, onSubmit, errors: backendErrors }) {
  const navigate = useNavigate()
  const steps = STEPS.filter(s => !s.pedidos10Only || currentUser?.isPedidos10)
  const [currentStep, setCurrentStep] = useState(0)
  const [stepErrors, setStepErrors] = useState(null)

  const totalSteps = steps.length
  const step = steps[currentStep]
  const isLastStep = currentStep === totalSteps - 1
  const progressPct = Math.round(((currentStep + 1) / totalSteps) * 100)

  async function validateStep(values) {
    // Replaced in task-03 and task-04
    return true
  }

  return (
    <Formik
      initialValues={licenseeInitialValues}
      validationSchema={Yup.object()}
      onSubmit={(values) => onSubmit(values)}
    >
      {(formik) => (
        <form onSubmit={formik.handleSubmit}>
          <h3>Criar Licenciado</h3>
          <p className='text-muted'>Passo {currentStep + 1} de {totalSteps} — {step.title}</p>

          <div className='progress mb-4' style={{ height: '6px' }}>
            <div
              className='progress-bar'
              role='progressbar'
              style={{ width: `${progressPct}%` }}
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Step content — placeholder; replaced in task-03 and task-04 */}
          <div className='mb-4'>
            <p>[Conteúdo do passo: {step.title}]</p>
          </div>

          {(backendErrors || stepErrors) && (
            <div className='alert alert-danger'>
              <ul className='mb-0'>
                {backendErrors?.map((e) => <li key={e.message || e}>{e.message || e}</li>)}
                {stepErrors?.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
          )}

          <div className='d-flex justify-content-between mt-4'>
            <button
              type='button'
              className='btn btn-secondary'
              onClick={() => navigate('/licensees')}
            >
              Cancelar
            </button>

            <div className='d-flex gap-2'>
              {currentStep > 0 && (
                <button
                  type='button'
                  className='btn btn-outline-secondary'
                  onClick={() => { setStepErrors(null); setCurrentStep(s => s - 1) }}
                >
                  ← Voltar
                </button>
              )}

              {!isLastStep ? (
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={async () => {
                    const valid = await validateStep(formik.values)
                    if (valid) {
                      setStepErrors(null)
                      setCurrentStep(s => s + 1)
                    }
                  }}
                >
                  Próximo →
                </button>
              ) : (
                <button type='submit' className='btn btn-success'>
                  Salvar
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </Formik>
  )
}

export default LicenseeWizard
```

### Step 3: Update New/index.js

Replace `<Form>` with `<LicenseeWizard>`:

```js
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { createLicensee } from '../../../../services/licensee'
import LicenseeWizard from './LicenseeWizard'

function LicenseeNew({ currentUser }) {
  const navigate = useNavigate()
  const [errors, setErrors] = useState(null)

  return (
    <div className='row'>
      <div className='col'>
        <LicenseeWizard
          currentUser={currentUser}
          errors={errors}
          onSubmit={async (values) => {
            const response = await createLicensee(values)
            if (response.status === 201) {
              toast.success('Licenciado criado com sucesso!')
              navigate('/licensees')
              setErrors(null)
            } else {
              setErrors(response.data.errors)
              toast.error('Ops! Não foi possível criar o licenciado.')
            }
          }}
        />
      </div>
    </div>
  )
}

export default LicenseeNew
```

Read the existing `New/index.js` carefully before modifying — match its import style and
any existing wrappers (currentUser prop, container layout).

### Step 4: Verify shell renders

```bash
npx jest --testPathPatterns=New
npx eslint client/src/pages/Licensees/scenes/New/
```

Existing New tests will likely fail (they expect the single-step form). Do not fix them here
— task-05 handles test updates. Just note the failures.

## Testing

- [ ] Manual: /licensees/new — wizard renders with progress bar + placeholder
- [ ] Manual: Próximo advances step; Voltar goes back; Cancelar goes to /licensees
- [ ] Manual: Salvar visible only on last step (step 6 or 7)
- [ ] Note any test failures without fixing (task-05 handles them)

## Documentation / KB Updates

None required at this stage.

## Completion Criteria

- [ ] `LicenseeWizard.js` created with step config, Formik wrapper, nav, progress bar
- [ ] `New/index.js` renders `<LicenseeWizard>` instead of `<Form>`
- [ ] Cancel navigates to /licensees from any step
- [ ] Back/Next navigate between placeholder steps
- [ ] Salvar visible only on last step
- [ ] No ESLint errors in modified files
