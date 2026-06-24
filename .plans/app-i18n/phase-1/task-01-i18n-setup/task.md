# Task: i18n Client Infrastructure

**Plan**: App Internationalization (PT/EN)
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-i18n-setup
**Depends On**: None
**JIRA**: N/A

## Objective

Install `react-i18next` + `i18next`, create the locale file structure, configure i18next, create the reusable `LanguageSwitcher` component, and update `IUser` with the language field — so every subsequent task can import `useTranslation` and the switcher without any setup work.

## Context

The app has zero i18n infrastructure. All strings are hardcoded Portuguese. This task lays the foundation every other task depends on.

Key conventions to match:
- Context pattern: `client/src/contexts/App/index.tsx` — `createContext` + `useContext` + typed interface + named `Provider` export
- Entry file: `client/src/index.tsx` — wraps `<App />` with `<AppContextProvider>`. Add `<I18nextProvider>` here as well.
- Types: `client/src/types/user.ts` — `IUser` interface, currently has no `language` field.
- Bootstrap Flatly theme is active — LanguageSwitcher should use Bootstrap button styles (`btn btn-sm btn-outline-secondary` / `btn btn-sm btn-secondary` for active).
- Package manager: `yarn` (run `yarn add` inside `client/`).

Look up the latest versions before installing:
```bash
cd client && npm show react-i18next version && npm show i18next version
```

## Before You Start

- [ ] Switch to the task branch: `git switch main && git pull --rebase origin main && git switch -c plan/app-i18n/phase-1/task-01-i18n-setup`
- [ ] Verify task-02 is NOT a dependency (tasks 01 and 02 are parallel — start independently)
- [ ] Check this task's `status.md` — must be `not-started`
- [ ] Mark this task `in-progress` in `status.md` before proceeding
- [ ] Look up current package versions (never install from memory — see CLAUDE.md)

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/package.json` | modify | Add `react-i18next` and `i18next` dependencies |
| `client/src/i18n/index.ts` | create | i18next configuration and init |
| `client/src/i18n/locales/pt.json` | create | Scaffolded with empty section keys only — tasks 03–08 populate content |
| `client/src/i18n/locales/en.json` | create | Same structure as pt.json, empty sections |
| `client/src/components/LanguageSwitcher/index.tsx` | create | PT/EN toggle component |
| `client/src/components/LanguageSwitcher/index.spec.tsx` | create | Component tests |
| `client/src/types/user.ts` | modify | Add `language: 'pt' \| 'en'` to `IUser` |
| `client/src/index.tsx` | modify | Wrap `<App>` with `<I18nextProvider i18n={i18n}>` |

### Do NOT Modify

- `client/src/pages/SignIn/index.tsx` — owned by phase-2/task-03-login-i18n
- `client/src/pages/SignIn/OnboardingModal.tsx` — owned by phase-2/task-04-onboarding-i18n
- `client/src/contexts/App/index.tsx` — language concerns live in i18n module, not AppContext
- `src/app/models/User.ts` — owned by phase-1/task-02-user-model-backend

## Implementation Steps

### Step 1: Install packages

```bash
# Look up versions first
cd client && npm show react-i18next version && npm show i18next version
# Then install with exact versions retrieved
yarn add react-i18next@<version> i18next@<version>
```

### Step 2: Create i18n configuration (`client/src/i18n/index.ts`)

```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import pt from './locales/pt.json'
import en from './locales/en.json'

const LANGUAGE_KEY = '@ecomanda-delivery-language'

export function saveLanguage(lang: 'pt' | 'en'): void {
  localStorage.setItem(LANGUAGE_KEY, lang)
}

export function loadLanguage(): 'pt' | 'en' {
  const stored = localStorage.getItem(LANGUAGE_KEY)
  return stored === 'en' ? 'en' : 'pt'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
    },
    lng: loadLanguage(),
    fallbackLng: 'pt',
    interpolation: { escapeValue: false },
  })

i18n.on('languageChanged', (lang) => {
  saveLanguage(lang as 'pt' | 'en')
})

export default i18n
```

### Step 3: Create scaffolded locale files

`client/src/i18n/locales/pt.json` — empty sections as placeholders (tasks 03–08 fill in the keys):
```json
{
  "login": {},
  "onboarding": {},
  "navbar": {},
  "licensees": {},
  "users": {},
  "sectors": {},
  "dashboard": {},
  "contacts": {},
  "templates": {},
  "triggers": {},
  "messages": {},
  "chat": {},
  "reports": {},
  "common": {}
}
```

`client/src/i18n/locales/en.json` — identical structure, empty sections.

### Step 4: Create LanguageSwitcher component (`client/src/components/LanguageSwitcher/index.tsx`)

The switcher must:
- Call `i18n.changeLanguage(lang)` (which also fires `languageChanged` → `saveLanguage`)
- Visually differentiate the active language
- Accept an optional `className` prop for layout flexibility

```tsx
import { useTranslation } from 'react-i18next'

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const active = i18n.language as 'pt' | 'en'

  return (
    <div className={`btn-group ${className ?? ''}`} role="group" aria-label="Language">
      <button
        type="button"
        className={`btn btn-sm ${active === 'pt' ? 'btn-secondary' : 'btn-outline-secondary'}`}
        onClick={() => i18n.changeLanguage('pt')}
      >
        PT
      </button>
      <button
        type="button"
        className={`btn btn-sm ${active === 'en' ? 'btn-secondary' : 'btn-outline-secondary'}`}
        onClick={() => i18n.changeLanguage('en')}
      >
        EN
      </button>
    </div>
  )
}
```

### Step 5: Update `IUser` type (`client/src/types/user.ts`)

Add `language` to the interface:
```typescript
export interface IUser {
  id: string
  name: string
  email: string
  active: boolean
  role: UserRole
  language: 'pt' | 'en'
  licensee: Pick<ILicensee, 'id' | 'name' | 'chatDefault' | 'useSectors'> | string | null
}
```

Also export a type alias for reuse:
```typescript
export type Language = 'pt' | 'en'
```

### Step 6: Wire I18nextProvider in entry file (`client/src/index.tsx`)

Import and wrap before `<AppContextProvider>` or inside it — either order works since they are independent providers. Wrapping outside is simplest:

```tsx
import i18n from './i18n'
import { I18nextProvider } from 'react-i18next'

root.render(
  <I18nextProvider i18n={i18n}>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </I18nextProvider>
)
```

## Testing

- [ ] Write `client/src/components/LanguageSwitcher/index.spec.tsx`:
  - Renders PT and EN buttons
  - Clicking EN calls `i18n.changeLanguage('en')`
  - Clicking PT calls `i18n.changeLanguage('pt')`
  - Active language button has `btn-secondary` class; inactive has `btn-outline-secondary`
  - Mock `react-i18next` using `vi.mock` following existing spec patterns
- [ ] Run `npx vitest run client/src/components/LanguageSwitcher` — must pass
- [ ] Run `npx vitest run client/src` — full client suite must still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No existing KB docs cover i18n — after this plan completes, run `document-solution` to capture the overall i18n setup pattern
- [ ] If `check-kb-index` is needed after KB file changes, run it

## Completion Criteria

- [ ] `react-i18next` and `i18next` installed in `client/package.json`
- [ ] `client/src/i18n/index.ts` exists and configures i18next with pt/en resources
- [ ] `client/src/i18n/locales/pt.json` and `en.json` exist with scaffolded section keys
- [ ] `LanguageSwitcher` component renders, toggles language, and persists via `saveLanguage`
- [ ] `IUser.language: 'pt' | 'en'` added; `Language` type exported
- [ ] `I18nextProvider` wraps `<App>` in `client/src/index.tsx`
- [ ] LanguageSwitcher tests pass
- [ ] Full client test suite passes
- [ ] Changes committed to `plan/app-i18n/phase-1/task-01-i18n-setup`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- This task runs in parallel with phase-1/task-02-user-model-backend. Task-02 modifies backend files only — no overlap.
- The scaffolded locale files created here are intentionally empty. Tasks 03–08 exclusively append content to them. Do not add translation key content in this task.
