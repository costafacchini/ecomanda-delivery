# Task: Licensees Pages i18n

**Plan**: App Internationalization (PT/EN)
**Phase**: 3
**Task ID (phase-local)**: task-06
**Task Path**: phase-3/task-06-licensees
**Depends On**: phase-3/task-05-navbar-layout
**JIRA**: N/A

## Objective

Extract all hardcoded strings from the Licensees feature pages (index, form panels, scenes) into `pt.json`/`en.json` under the `licensees.*` namespace.

## Context

Licensees is the most complex page area in the app. It has multiple scenes and panels:

```
client/src/pages/Licensees/
├── routes.tsx
└── scenes/
    ├── Form/        — Edit licensee form (4 tabs: Principal, Chat, ChatBot, WhatsApp)
    │   └── panels/  — ChatPanel, ChatBotPanel, WhatsAppPanel, PrincipalPanel (or similar)
    ├── Index/       — List page
    ├── New/         — Create wizard (LicenseeWizard — 4 steps)
    └── Edit/        — Edit page
```

Read the directory structure and each file before writing keys. The survey shows panel files with hardcoded option labels and form field labels. There may also be Yup schemas — apply the same `useMemo` pattern from task-04 if needed.

**common.* reuse**: Many button labels ("Salvar", "Cancelar", "Próximo", "Voltar") were added to `common.*` in task-05. Use `t('common.save')` etc. rather than duplicating keys.

## Before You Start

- [ ] Switch to the task branch: `git switch main && git pull --rebase origin main && git switch -c plan/app-i18n/phase-3/task-06-licensees`
- [ ] Verify phase-3/task-05-navbar-layout `status.md` shows `complete`
- [ ] Check this task's `status.md` — must be `not-started`
- [ ] Run `find client/src/pages/Licensees -name "*.tsx" | sort` to enumerate all files
- [ ] Read each file for hardcoded strings before writing any translation keys
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Licensees/**/*.tsx` | modify | Replace strings with `t()` calls |
| `client/src/i18n/locales/pt.json` | modify | Append `licensees.*` keys |
| `client/src/i18n/locales/en.json` | modify | Append `licensees.*` keys (English) |

### Do NOT Modify

- Any file outside `client/src/pages/Licensees/`
- Files in `client/src/pages/Users/`, `Sectors/`, `Dashboard/` — owned by task-07
- Files in `client/src/pages/Contacts/`, `Templates/`, `Triggers/`, `Messages/`, `Chat/`, `Reports/` — owned by task-08

## Implementation Steps

### Step 1: Enumerate and audit

```bash
find client/src/pages/Licensees -name "*.tsx" | sort
```

Read each file. Build the full key list under `licensees.*`. Group logically: `licensees.index.*`, `licensees.form.*`, `licensees.form.chat.*`, `licensees.form.chatbot.*`, `licensees.form.whatsapp.*`, `licensees.wizard.*`, etc.

### Step 2: Apply translations

For each component file:
1. Add `import { useTranslation } from 'react-i18next'`
2. Add `const { t } = useTranslation()` inside the component
3. Replace hardcoded strings with `t('licensees.section.key')` or `t('common.key')` for shared terms
4. If Yup schemas are present, wrap with `useMemo(() => schema(t), [t])` (same pattern as task-04)

### Step 3: Update locale files

Append `licensees.*` section to both `pt.json` and `en.json`. Verify JSON validity.

## Testing

- [ ] Run `npx vitest run client/src/pages/Licensees` — all tests must pass
- [ ] Run `npx vitest run client/src` — full suite must pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required for this task

## Completion Criteria

- [ ] All files in `client/src/pages/Licensees/` have zero hardcoded Portuguese strings
- [ ] `pt.json`/`en.json` have complete `licensees.*` section
- [ ] All client tests pass
- [ ] Changes committed to `plan/app-i18n/phase-3/task-06-licensees`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- Task-07 depends on this task. Commit locale files in valid JSON state.
