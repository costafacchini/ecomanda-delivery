# Task: Onboarding Wizard i18n + Language Switcher

**Plan**: App Internationalization (PT/EN)
**Phase**: 2
**Task ID (phase-local)**: task-04
**Task Path**: phase-2/task-04-onboarding-i18n
**Depends On**: phase-2/task-03-login-i18n
**JIRA**: N/A

## Objective

Extract all hardcoded strings from `OnboardingModal.tsx` (JSX labels, Yup validation messages, step title maps, button text) into `pt.json`/`en.json`, add the `LanguageSwitcher` to the modal header, and send the selected language in the POST /login/onboarding payload so the backend persists it on the created User.

## Context

`OnboardingModal.tsx` is a 5-step wizard with significant string density:

- **Step title map**: `stepTitles: Record<StepId, string>` — currently a static TypeScript object with Portuguese strings
- **JSX labels**: form labels, placeholders, option labels on every step
- **Yup schemas**: validation error messages embedded directly in `Yup.string().required('...')` calls
- **Button text**: "Próximo →", "Voltar", "Cancelar", "Criar conta"
- **Inline error/info messages**: conditional strings rendered in JSX

**Critical challenge — Yup schemas are static**: Yup validation schemas are typically defined at module level. Their error messages are evaluated once. To make them react to language changes:

1. Move the schema definition **inside the component** (or into a factory function)
2. Wrap with `useMemo(() => buildSchemaForStep(currentStep, t), [currentStep, t])` — this re-creates the schema whenever the translation function or step changes
3. This is the standard pattern for react-i18next + Yup

**POST /login/onboarding payload**: The wizard's final submit function sends a POST request. Add `language: i18n.language as 'pt' | 'en'` to the payload body. The backend (task-02) already accepts this field.

**Language persistence**: When the user switches language inside the onboarding modal, `i18n.changeLanguage()` updates the UI immediately AND persists to localStorage (wired in `i18n/index.ts` by task-01). No additional persistence logic needed here — just calling `i18n.changeLanguage()` is sufficient.

Read `OnboardingModal.tsx` fully before writing any translation keys. The audit from the codebase survey is a starting point; the file may have more strings.

## Before You Start

- [ ] Switch to the task branch: `git switch main && git pull --rebase origin main && git switch -c plan/app-i18n/phase-2/task-04-onboarding-i18n`
- [ ] Verify phase-2/task-03-login-i18n `status.md` shows `complete`
- [ ] Check this task's `status.md` — must be `not-started`
- [ ] Read `client/src/pages/SignIn/OnboardingModal.tsx` in full — capture ALL strings and schema error messages
- [ ] Read `client/src/pages/SignIn/OnboardingModal.spec.tsx` — understand what is currently tested
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/SignIn/OnboardingModal.tsx` | modify | Replace strings with `t()`, dynamic Yup, LanguageSwitcher, language in payload |
| `client/src/pages/SignIn/OnboardingModal.spec.tsx` | modify | Add i18n mock, update/add tests for language behavior |
| `client/src/i18n/locales/pt.json` | modify | Append `onboarding.*` keys |
| `client/src/i18n/locales/en.json` | modify | Append `onboarding.*` keys (English) |

### Do NOT Modify

- `client/src/pages/SignIn/index.tsx` — owned by phase-2/task-03-login-i18n (already complete)
- `client/src/components/LanguageSwitcher/index.tsx` — read-only (owned by phase-1/task-01)
- `client/src/i18n/index.ts` — read-only (owned by phase-1/task-01)

## Implementation Steps

### Step 1: Audit OnboardingModal.tsx for all strings

Read the file. Build a complete list. Group by step. Key namespace: `onboarding.*`. Example structure:

```json
{
  "onboarding": {
    "steps": {
      "identity": "Dados da Empresa",
      "integrations": "Integrações",
      "chat": "Chat",
      "whatsapp": "WhatsApp",
      "credentials": "Credenciais do Usuário"
    },
    "buttons": {
      "next": "Próximo →",
      "back": "Voltar",
      "cancel": "Cancelar",
      "submit": "Criar conta"
    },
    "identity": {
      "companyNameLabel": "Nome da empresa",
      "companyNameRequired": "Nome da empresa é obrigatório",
      ...
    },
    "integrations": { ... },
    "chat": { ... },
    "whatsapp": { ... },
    "credentials": { ... }
  }
}
```

Mirror the same keys in `en.json` with English values.

### Step 2: Update OnboardingModal.tsx — hook and step titles

1. Add `import { useTranslation } from 'react-i18next'`
2. Add `import { LanguageSwitcher } from '../../components/LanguageSwitcher'`
3. Inside the component: `const { t, i18n } = useTranslation()`
4. Convert `stepTitles` from a static object to a derived value:
   ```typescript
   const stepTitles: Record<StepId, string> = {
     identity: t('onboarding.steps.identity'),
     integrations: t('onboarding.steps.integrations'),
     chat: t('onboarding.steps.chat'),
     whatsapp: t('onboarding.steps.whatsapp'),
     credentials: t('onboarding.steps.credentials'),
   }
   ```
   This must be inside the component body (re-evaluated on language change).

### Step 3: Make Yup schemas dynamic

Move schema definitions inside the component and wrap with `useMemo`:

```typescript
const identitySchema = useMemo(
  () =>
    Yup.object({
      licenseeName: Yup.string().required(t('onboarding.identity.companyNameRequired')),
      // ... other fields
    }),
  [t]
)
```

Repeat for each step's schema. The `t` function reference changes when language changes, causing `useMemo` to re-compute with updated error strings.

### Step 4: Replace JSX strings with `t()` calls

Replace every hardcoded string in JSX with the corresponding `t('onboarding.section.key')` call.

### Step 5: Add LanguageSwitcher to modal header

Place `<LanguageSwitcher className="ms-auto" />` in the modal header area (Bootstrap modal-header), aligned to the right alongside or near the close button. The exact placement depends on the current modal layout — read the JSX to find the appropriate position.

### Step 6: Add `language` to submit payload

In the final submit function, include:
```typescript
language: i18n.language as 'pt' | 'en',
```

in the payload sent to `POST /login/onboarding`.

### Step 7: Update spec file

In `OnboardingModal.spec.tsx`:
1. Add standard `react-i18next` mock at the top:
   ```typescript
   vi.mock('react-i18next', () => ({
     useTranslation: () => ({
       t: (k: string) => k,
       i18n: { language: 'pt', changeLanguage: vi.fn() },
     }),
   }))
   ```
2. Add a test: switching the LanguageSwitcher calls `i18n.changeLanguage`
3. Add a test: submit payload includes `language`
4. Ensure all existing tests still pass (they may need adjustment if they assert on exact Portuguese strings — update them to assert on translation keys instead)

## Testing

- [ ] Run `npx vitest run client/src/pages/SignIn` — all tests must pass
- [ ] Manual check: open the modal and verify language switch updates step titles, labels, and validation errors live
- [ ] Verify: `language` field appears in the network request to POST /login/onboarding
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required for this task alone — the overall i18n pattern will be documented after the plan completes via `document-solution`

## Completion Criteria

- [ ] `OnboardingModal.tsx` has zero hardcoded Portuguese strings
- [ ] `LanguageSwitcher` visible in modal header
- [ ] Step titles, labels, Yup error messages all update on language switch
- [ ] `language` field included in POST /login/onboarding payload
- [ ] `pt.json` and `en.json` have complete `onboarding.*` section
- [ ] All spec tests pass including new language-related tests
- [ ] Changes committed to `plan/app-i18n/phase-2/task-04-onboarding-i18n`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- Task-05 (navbar) depends on this task completing first due to shared locale files. Commit locale file changes in a complete, parseable JSON state.
