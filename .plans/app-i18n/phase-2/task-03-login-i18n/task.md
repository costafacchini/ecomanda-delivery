# Task: Login Page i18n + Language Switcher + Post-Login Hydration

**Plan**: App Internationalization (PT/EN)
**Phase**: 2
**Task ID (phase-local)**: task-03
**Task Path**: phase-2/task-03-login-i18n
**Depends On**: phase-1/task-01-i18n-setup, phase-1/task-02-user-model-backend
**JIRA**: N/A

## Objective

Extract all hardcoded strings from the login page (`SignIn/index.tsx`) into `pt.json`/`en.json`, add the `LanguageSwitcher` component to the login page UI, and wire post-login language hydration in both `SignIn/index.tsx` and `routes.tsx` so the app switches to `user.language` after every login or session restore.

## Context

This task is the first to write actual translation keys into the locale files. All subsequent tasks in phases 2–3 will append more keys — never overwrite existing ones.

**Login page** (`client/src/pages/SignIn/index.tsx`):
- Uses `fetchLoggedUser()` to retrieve the user object after login (line ~39)
- Uses `setCurrentUser()` from `useApp()` to store the logged-in user
- After `fetchLoggedUser()` resolves, we must call `i18n.changeLanguage(user.language)` to apply the saved preference

**Session restore** (`client/src/pages/routes.tsx`):
- On mount, if `isAuthenticated() && !currentUser`, calls `fetchLoggedUser()` and `setCurrentUser()` (lines 22–28)
- Same hydration hook needed here for page-refresh cases

**Hardcoded strings found in `SignIn/index.tsx`** (audit the file directly — the list below is a starting point):
- Form labels: "email", "senha"
- Button: "Entrar"
- Error messages: "Preencha e-mail e senha para continuar!", "Erro ao fazer login"
- Links/prompts: "Não tem uma conta?", "Criar conta"
- Success: "Conta criada com sucesso! Faça login para continuar."

Read the file before writing any translation keys to capture ALL strings, including any added since the survey.

**i18n instance**: import from `../../i18n` (or the relative path from the file location). Use `useTranslation()` hook to get `t` and `i18n`.

## Before You Start

- [ ] Switch to the task branch: `git switch main && git pull --rebase origin main && git switch -c plan/app-i18n/phase-2/task-03-login-i18n`
- [ ] Verify phase-1/task-01-i18n-setup `status.md` shows `complete` (merge its branch first if needed)
- [ ] Verify phase-1/task-02-user-model-backend `status.md` shows `complete`
- [ ] Check this task's `status.md` — must be `not-started`
- [ ] Read `client/src/pages/SignIn/index.tsx` in full — capture every hardcoded string
- [ ] Read `client/src/pages/routes.tsx` — understand the `fetchLoggedUser` effect
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/SignIn/index.tsx` | modify | Replace hardcoded strings with `t()` calls + add LanguageSwitcher |
| `client/src/pages/SignIn/index.spec.tsx` (if it exists) | modify | Update tests to mock i18n |
| `client/src/pages/routes.tsx` | modify | Add `i18n.changeLanguage(user.language)` in session-restore effect |
| `client/src/i18n/locales/pt.json` | modify | Append `login.*` keys |
| `client/src/i18n/locales/en.json` | modify | Append `login.*` keys (English translations) |

### Do NOT Modify

- `client/src/pages/SignIn/OnboardingModal.tsx` — owned by phase-2/task-04-onboarding-i18n
- `client/src/components/LanguageSwitcher/index.tsx` — owned by phase-1/task-01-i18n-setup (read-only here)
- `client/src/i18n/index.ts` — owned by phase-1/task-01-i18n-setup (read-only here)

## Implementation Steps

### Step 1: Audit SignIn/index.tsx for all strings

Read the file. List every hardcoded string. Plan the translation key namespace: `login.*`. Examples:
```json
{
  "login": {
    "emailLabel": "E-mail",
    "passwordLabel": "Senha",
    "submitButton": "Entrar",
    "noAccount": "Não tem uma conta?",
    "createAccount": "Criar conta",
    "emptyFieldsError": "Preencha e-mail e senha para continuar!",
    "loginError": "Erro ao fazer login",
    "accountCreated": "Conta criada com sucesso! Faça login para continuar."
  }
}
```

Add corresponding English translations to `en.json`:
```json
{
  "login": {
    "emailLabel": "E-mail",
    "passwordLabel": "Password",
    "submitButton": "Sign in",
    "noAccount": "Don't have an account?",
    "createAccount": "Create account",
    "emptyFieldsError": "Please enter your email and password to continue.",
    "loginError": "Login error",
    "accountCreated": "Account created successfully! Sign in to continue."
  }
}
```

### Step 2: Update SignIn/index.tsx

1. Add `import { useTranslation } from 'react-i18next'`
2. Add `import { LanguageSwitcher } from '../../components/LanguageSwitcher'`
3. Inside component: `const { t, i18n } = useTranslation()`
4. Replace every hardcoded string with `t('login.keyName')`
5. After `fetchLoggedUser()` resolves and `user` is available, call `i18n.changeLanguage(user.language)` before or after `setCurrentUser(user ?? undefined)`
6. Add `<LanguageSwitcher className="mb-3" />` to the login form UI (above or below the form title — choose the position that fits the existing layout)

### Step 3: Update routes.tsx for session restore

In the `useEffect` that calls `fetchLoggedUser()`:
```typescript
import i18n from '../i18n'

fetchLoggedUser().then(user => {
  setCurrentUser(user ?? undefined)
  if (user?.language) {
    i18n.changeLanguage(user.language)
  }
})
```

### Step 4: Update `common` section in locale files

Add any shared strings used across the app that appear in this file (e.g., generic error/success messages) under a `common.*` namespace rather than duplicating them in multiple sections.

## Testing

- [ ] Run `npx vitest run client/src/pages/SignIn` — existing tests must still pass
- [ ] If tests exist for `SignIn/index.tsx`, ensure they mock `useTranslation` (use `vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k, i18n: { changeLanguage: vi.fn() } }) }))`)
- [ ] Verify: switching language on login page updates the page text immediately (manual test or snapshot)
- [ ] Verify: after login, `i18n.language` matches `user.language` from the API response
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required for this task

## Completion Criteria

- [ ] `SignIn/index.tsx` has zero hardcoded Portuguese strings
- [ ] `LanguageSwitcher` is visible on the login page
- [ ] `routes.tsx` calls `i18n.changeLanguage(user.language)` in the session-restore effect
- [ ] `pt.json` and `en.json` have complete `login.*` section with all strings
- [ ] All client tests pass
- [ ] Changes committed to `plan/app-i18n/phase-2/task-03-login-i18n`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- Task-04 (onboarding) depends on this task completing first — specifically because task-04 also writes to `pt.json`/`en.json`. Do not leave locale files in a partial state when committing.
- `routes.tsx` change in this task (language hydration) is additive — it does not modify existing logic, only appends to the `fetchLoggedUser().then()` callback.
