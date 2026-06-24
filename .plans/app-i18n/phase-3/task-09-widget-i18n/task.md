# Task: Chat Widget i18n

**Plan**: App Internationalization (PT/EN)
**Phase**: 3
**Task ID (phase-local)**: task-09
**Task Path**: phase-3/task-09-widget-i18n
**Depends On**: phase-1/task-01-i18n-setup
**JIRA**: N/A

## Objective

Add Portuguese/English support to the embeddable chat widget (`widget/src/`). The widget is a separate IIFE bundle isolated in Shadow DOM — it cannot share the main app's i18next instance. Use a lightweight translations map instead. Expose `language` via (1) `data-language` attribute on the `<script>` tag, (2) `EcomandaWidget.init({ language? })` for Mode 2, defaulting to `'pt'`.

## Context

The widget lives in `widget/src/` — a completely separate Vite project (its own `package.json`, `tsconfig.json`, `vite.config.ts`). It is compiled as a single IIFE (`widget.js`) and mounted into a Shadow DOM root, so it is fully isolated from the main React app's providers and context.

**Do NOT add `react-i18next` or `i18next` to the widget.** Those libraries would bloat the bundle unnecessarily. A simple translations object is sufficient for ~12 strings.

**String inventory** (all files with user-facing text):

`widget/src/components/SessionForm.tsx`:
- `"Iniciar conversa"` — heading + submit button
- `"Preencha seus dados para começar o atendimento."` — subheading
- `"Nome"` — label
- `"Seu nome"` — placeholder
- `"E-mail"` — label
- `"Informe um e-mail válido."` — validation error
- `"Telefone (opcional)"` — label
- `"(00) 00000-0000"` — phone placeholder
- `"Aguarde..."` — loading button state

`widget/src/components/MessageInput.tsx`:
- `placeholder="Digite uma mensagem..."` 
- `aria-label="Mensagem"`
- `aria-label="Enviar mensagem"`

No other widget files contain user-facing strings.

**Language resolution order** (highest priority first):
1. `EcomandaWidget.init({ language: 'en' })` — Mode 2 authenticated, set at runtime
2. `<script data-licensee="TOKEN" data-language="en">` — declarative, set at install time
3. Default: `'pt'`

**How Mode 2 connects to the main app**: When the main app (authenticated) calls `EcomandaWidget.init({ name, email, language: i18n.language })`, the widget switches to that language. This is the primary integration path for app-i18n.

## Before You Start

- [ ] Switch to the task branch: `git switch main && git pull --rebase origin main && git switch -c plan/app-i18n/phase-3/task-09-widget-i18n`
- [ ] Verify phase-1/task-01-i18n-setup `status.md` shows `complete` (so the main app has `i18n.language` available for Mode 2 callers)
- [ ] Check this task's `status.md` — must be `not-started`
- [ ] Re-read `widget/src/main.tsx`, `SessionForm.tsx`, `MessageInput.tsx`, `App.tsx` to confirm the string inventory matches this task file (it may have changed)
- [ ] Check `widget/package.json` — do NOT add any i18n package
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `widget/src/translations.ts` | create | `{ pt: {...}, en: {...} }` string map + `Language` type |
| `widget/src/main.tsx` | modify | Read `data-language`; add `language` to `InitData`; thread to `App` |
| `widget/src/App.tsx` | modify | Accept + forward `language` prop to `SessionForm` + `MessageInput` |
| `widget/src/components/SessionForm.tsx` | modify | Accept `language` prop; replace hardcoded strings |
| `widget/src/components/MessageInput.tsx` | modify | Accept `language` prop; replace hardcoded strings |
| `widget/src/types.ts` | modify | Export `Language = 'pt' \| 'en'` type alias |

### Do NOT Modify

- Anything in `client/src/` — owned by tasks 03–08
- `widget/package.json` — no new dependencies
- `widget/src/components/ChatPopup.tsx`, `FloatingButton.tsx`, `MessageList.tsx` — no user-facing strings

## Implementation Steps

### Step 1: Add `Language` type to `widget/src/types.ts`

```typescript
export type Language = 'pt' | 'en'
```

### Step 2: Create `widget/src/translations.ts`

```typescript
import type { Language } from './types'

interface WidgetStrings {
  sessionForm: {
    heading: string
    subheading: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    emailError: string
    phoneLabel: string
    phonePlaceholder: string
    loadingButton: string
    submitButton: string
  }
  messageInput: {
    placeholder: string
    ariaLabel: string
    sendAriaLabel: string
  }
}

const translations: Record<Language, WidgetStrings> = {
  pt: {
    sessionForm: {
      heading: 'Iniciar conversa',
      subheading: 'Preencha seus dados para começar o atendimento.',
      namePlaceholder: 'Seu nome',
      emailLabel: 'E-mail',
      emailPlaceholder: 'seu@email.com',
      emailError: 'Informe um e-mail válido.',
      phoneLabel: 'Telefone (opcional)',
      phonePlaceholder: '(00) 00000-0000',
      loadingButton: 'Aguarde...',
      submitButton: 'Iniciar conversa',
    },
    messageInput: {
      placeholder: 'Digite uma mensagem...',
      ariaLabel: 'Mensagem',
      sendAriaLabel: 'Enviar mensagem',
    },
  },
  en: {
    sessionForm: {
      heading: 'Start a conversation',
      subheading: 'Fill in your details to begin.',
      namePlaceholder: 'Your name',
      emailLabel: 'E-mail',
      emailPlaceholder: 'you@email.com',
      emailError: 'Please enter a valid email address.',
      phoneLabel: 'Phone (optional)',
      phonePlaceholder: '+1 (000) 000-0000',
      loadingButton: 'Please wait...',
      submitButton: 'Start conversation',
    },
    messageInput: {
      placeholder: 'Type a message...',
      ariaLabel: 'Message',
      sendAriaLabel: 'Send message',
    },
  },
}

export function useWidgetStrings(language: Language): WidgetStrings {
  return translations[language] ?? translations.pt
}
```

### Step 3: Update `widget/src/types.ts` — extend `InitData` signature

Add `Language` export (done in step 1). `InitData` is defined in `main.tsx`, not `types.ts` — update it there.

### Step 4: Update `widget/src/main.tsx`

1. Read `data-language` from the script element:
   ```typescript
   const rawLang = scriptEl?.dataset.language
   const defaultLanguage: Language = rawLang === 'en' ? 'en' : 'pt'
   ```

2. Add `language?` to `InitData`:
   ```typescript
   type InitData = { name: string; email: string; phone?: string; language?: Language }
   ```

3. Add `language` state to `WidgetRoot`, initialized from `defaultLanguage`:
   ```typescript
   const [language, setLanguage] = useState<Language>(defaultLanguage)
   ```

4. In the `_handler` assignment (inside `useEffect`), extract and apply `language`:
   ```typescript
   api._handler = (data) => {
     if (data.language) setLanguage(data.language)
     createSessionRef.current(data.name, data.email, data.phone)
   }
   ```
   And in the `_pending` flush:
   ```typescript
   if (api._pending) {
     const { name, email, phone, language: pendingLang } = api._pending
     api._pending = null
     if (pendingLang) setLanguage(pendingLang)
     createSessionRef.current(name, email, phone)
   }
   ```

5. Pass `language` to `<App>`:
   ```tsx
   <App ... language={language} />
   ```

### Step 5: Update `widget/src/App.tsx`

Add `language: Language` to `AppProps` and forward it:
```tsx
interface AppProps {
  // ...existing props...
  language: Language
}

// In JSX:
<SessionForm onSubmit={onSessionCreate} loading={sessionLoading} language={language} />
<MessageInput onSend={onSend} disabled={sendDisabled} language={language} />
```

### Step 6: Update `widget/src/components/SessionForm.tsx`

1. Add `language: Language` to `SessionFormProps`
2. Import `useWidgetStrings` from `'../translations'`
3. Inside component: `const strings = useWidgetStrings(language)`
4. Replace every hardcoded string — e.g.:
   - `<p style={headingStyle}>{strings.sessionForm.heading}</p>`
   - `placeholder={strings.sessionForm.namePlaceholder}`
   - `setEmailError(strings.sessionForm.emailError)`
   - `{loading ? strings.sessionForm.loadingButton : strings.sessionForm.submitButton}`
   - Remove the hardcoded `"Nome"` label — replace with `strings.sessionForm.namePlaceholder` as label text (or add a `nameLabel` key if needed)

> Note: `SessionForm` currently has no separate `nameLabel` key — it renders `"Nome"` as label text. Add `nameLabel: 'Nome'` / `'Name'` to the translations if the label is rendered separately from the placeholder.

### Step 7: Update `widget/src/components/MessageInput.tsx`

1. Add `language: Language` to `MessageInputProps`
2. Import `useWidgetStrings`
3. Replace the three hardcoded strings:
   ```tsx
   const strings = useWidgetStrings(language)
   // ...
   placeholder={strings.messageInput.placeholder}
   aria-label={strings.messageInput.ariaLabel}
   // send button:
   aria-label={strings.messageInput.sendAriaLabel}
   ```

## Testing

- [ ] Run the widget build to verify it compiles: `cd widget && yarn build` (or check the build command in `widget/package.json`)
- [ ] If widget tests exist (`widget/src/**/*.spec.*`): run them and verify they pass
- [ ] Manual test — build widget and load it on a test page:
  - Default (no `data-language`): renders in Portuguese
  - `<script data-language="en">`: renders in English
  - `EcomandaWidget.init({ name: 'Test', email: 'a@b.com', language: 'en' })`: widget renders in English, session form skipped
  - Switching language via `init` after mount updates labels
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] This task is part of the same i18n `document-solution` entry to be written after task-08 completes — note the widget's lightweight translations-map approach as an alternative to react-i18next for isolated IIFE bundles

## Completion Criteria

- [ ] `widget/src/translations.ts` created with complete PT and EN string maps
- [ ] `Language` type exported from `widget/src/types.ts`
- [ ] `EcomandaWidget.init({ language? })` accepts and applies language at runtime
- [ ] `data-language` attribute on script tag sets the default language
- [ ] `SessionForm` and `MessageInput` render in the active language
- [ ] Widget build succeeds (`yarn build` in `widget/`)
- [ ] No i18n packages added to `widget/package.json`
- [ ] Changes committed to `plan/app-i18n/phase-3/task-09-widget-i18n`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- This task owns only `widget/src/` files — zero overlap with tasks 05–08 which own `client/src/`. It can run in parallel with any phase-3 task from a file ownership standpoint.
- It is listed last (task-09) purely for ordering clarity, not because it must wait for tasks 05–08 to complete.
