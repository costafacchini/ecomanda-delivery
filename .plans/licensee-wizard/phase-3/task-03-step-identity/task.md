# Task: Step 1 — Identity Fields

**Plan**: Licensee Create Wizard + Edit Simplification
**Task ID**: task-03
**Task Path**: phase-3/task-03-step-identity
**Depends On**: phase-2/task-02-wizard-shell
**JIRA**: N/A

## Before You Start

- [ ] Confirm `phase-2/task-02-wizard-shell` is `complete`
- [ ] Branch from task-02: `git switch plan/licensee-wizard/phase-2/task-02-wizard-shell && git switch -c plan/licensee-wizard/phase-3/task-03-step-identity`
- [ ] Read `LicenseeWizard.js` — understand the placeholder step content area and validateStep function
- [ ] Read `MainPanel.js` — identity fields JSX to reuse as reference
- [ ] **IMPORTANT**: task-04 will branch from THIS task's branch

## Context

Implement Step 1 (Identity) content inside `LicenseeWizard.js`. Six identity fields, all
required before Next can advance.

### Fields

| Field | Type | Required | Label |
|-------|------|----------|-------|
| `name` | text | yes | Nome |
| `kind` | select (company/individual) | yes | Tipo |
| `document` | text | yes | Documento |
| `email` | text/email | yes | E-mail |
| `licenseKind` | select (demo/free/paid) | yes | Licença |
| `phone` | text | yes | Telefone |

Do NOT include apiToken or webhook URLs — those are read-only fields only relevant in Edit.

### Yup schema

```js
const identitySchema = Yup.object().shape({
  name:        Yup.string().required('Nome é obrigatório'),
  kind:        Yup.string().required('Tipo é obrigatório'),
  document:    Yup.string().required('Documento é obrigatório'),
  email:       Yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  licenseKind: Yup.string().required('Licença é obrigatória'),
  phone:       Yup.string().required('Telefone é obrigatório'),
})
```

### validateStep update

Replace the placeholder `return true` with schema dispatch:

```js
async function validateStep(values) {
  const schemas = {
    identity: identitySchema,
    // STEPS 2-7 ADDED IN task-04 ↓
  }
  const schema = schemas[step.id]
  if (!schema) return true
  try {
    await schema.validate(values, { abortEarly: false })
    return true
  } catch (err) {
    setStepErrors(err.errors)
    return false
  }
}
```

### Step content rendering

Replace the placeholder `<p>[Conteúdo do passo: {step.title}]</p>` with:

```jsx
<div className='mb-4'>
  {step.id === 'identity' && (
    <IdentityStep
      values={formik.values}
      errors={formik.errors}
      touched={formik.touched}
      handleChange={formik.handleChange}
      handleBlur={formik.handleBlur}
    />
  )}
  {/* STEPS 2-7 ADDED IN task-04 ↓ */}
</div>
```

### IdentityStep component

Create as an inline function inside `LicenseeWizard.js` (above the main component):

```js
function IdentityStep({ values, errors, touched, handleChange, handleBlur }) {
  return (
    <>
      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='name'>Nome</label>
          <FieldWithError id='name' type='text' name='name'
            value={values.name} onChange={handleChange} onBlur={handleBlur} />
        </div>
        <div className='form-group col-5'>
          <div className='form-check mt-4'>
            <input checked={values.active} onChange={handleChange} onBlur={handleBlur}
              type='checkbox' className='form-check-input' id='active' />
            <label className='form-check-label' htmlFor='active'>Ativo</label>
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='form-group col-2'>
          <label htmlFor='kind'>Tipo</label>
          <select value={values.kind} className='form-select' id='kind'
            onChange={handleChange} onBlur={handleBlur}>
            <option value=''></option>
            <option value='company'>Jurídica</option>
            <option value='individual'>Física</option>
          </select>
        </div>
        <div className='form-group col-3'>
          <label htmlFor='document'>Documento</label>
          <FieldWithError id='document' name='document' type='text'
            value={values.document} onChange={handleChange} onBlur={handleBlur} />
        </div>
      </div>
      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='email'>E-mail</label>
          <FieldWithError id='email' name='email' type='text'
            value={values.email} onChange={handleChange} onBlur={handleBlur} />
        </div>
      </div>
      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='licenseKind'>Licença</label>
          <select value={values.licenseKind} className='form-select' id='licenseKind'
            onChange={handleChange} onBlur={handleBlur}>
            <option value='demo'>Demonstração</option>
            <option value='free'>Grátis</option>
            <option value='paid'>Pago</option>
          </select>
        </div>
      </div>
      <div className='row mt-3'>
        <div className='form-group col-5'>
          <label htmlFor='phone'>Telefone</label>
          <FieldWithError id='phone' name='phone' type='text'
            value={values.phone} onChange={handleChange} onBlur={handleBlur} />
        </div>
      </div>
    </>
  )
}
```

Match the exact field layout from `MainPanel.js` (same Bootstrap col classes, same labels).

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Licensees/scenes/New/LicenseeWizard.js` | modify | Add identitySchema, validateStep dispatch, IdentityStep component, step.id conditional rendering |

### Do NOT Modify

- `client/src/pages/Licensees/scenes/New/index.js`
- `client/src/pages/Licensees/scenes/Form/panels/MainPanel.js`
- Any panel file

## Conflict Avoidance Notes

task-04 branches from this task's branch and adds schemas + rendering for steps 2-7 in
the same `validateStep` function and the same step content `<div>`. Leave clear markers:

```js
// STEPS 2-7 ADDED IN task-04 ↓
```

in both the `schemas` object and the step content conditional block.

## Implementation Steps

### Step 1: Add `identitySchema` at module level in LicenseeWizard.js

### Step 2: Replace `validateStep` placeholder with schema dispatch

### Step 3: Add `IdentityStep` component (above `LicenseeWizard` function)

### Step 4: Replace step content placeholder with `{step.id === 'identity' && <IdentityStep .../>}`

### Step 5: Verify

```bash
npx jest --testPathPatterns=New
npx eslint client/src/pages/Licensees/scenes/New/
```

## Testing

- [ ] Manual: /licensees/new → Step 1 shows 6 identity fields
- [ ] Manual: click Próximo with empty fields → errors appear, no advance
- [ ] Manual: fill all 6 fields → Próximo advances to Step 2 (placeholder)
- [ ] Manual: Voltar returns to Step 1 with values preserved
- [ ] `npx jest --testPathPatterns=New` — note results (full update in task-05)

## Documentation / KB Updates

None required.

## Completion Criteria

- [ ] Step 1 renders name, kind, document, email, licenseKind, phone
- [ ] Next with empty fields shows Yup errors and does not advance
- [ ] Filling all 6 required fields allows Next to advance
- [ ] Values preserved when going Back to step 1
- [ ] `// STEPS 2-7 ADDED IN task-04 ↓` markers present in validateStep and step content block
- [ ] No ESLint errors
