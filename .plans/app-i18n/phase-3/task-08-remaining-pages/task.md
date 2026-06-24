# Task: Contacts + Templates + Triggers + Messages + Chat + Reports i18n

**Plan**: App Internationalization (PT/EN)
**Phase**: 3
**Task ID (phase-local)**: task-08
**Task Path**: phase-3/task-08-remaining-pages
**Depends On**: phase-3/task-07-users-sectors-dashboard
**JIRA**: N/A

## Objective

Extract all hardcoded strings from the remaining authenticated pages — Contacts, Templates, Triggers, Messages, Chat, and Reports — completing full app coverage. After this task, no hardcoded Portuguese strings should remain in `client/src/`.

## Context

This is the final translation sweep. Six page areas:

- **Contacts** (`client/src/pages/Contacts/`) — contact list, form, detail view
- **Templates** (`client/src/pages/Templates/`) — template list and form
- **Triggers** (`client/src/pages/Triggers/`) — trigger list and form
- **Messages** (`client/src/pages/Messages/`) — message list/viewer
- **Chat** (`client/src/pages/Chat/`) — full-screen agent chat UI (note: Chat is a `noLayout` route — may have distinct UI patterns)
- **Reports** (`client/src/pages/Reports/`) — report views

Run `find` on each directory before reading files. Use `common.*` for shared labels already defined in task-05.

After completing translations, run a final grep to verify no hardcoded Portuguese strings remain anywhere in `client/src/`:
```bash
# Check for common Portuguese patterns
grep -r "ção\|ões\|ão\|ões\|Salvar\|Cancelar\|Próximo\|Voltar" client/src --include="*.tsx" --include="*.ts" -l
```
The result should only match `*.json` locale files — not component or service files.

## Before You Start

- [ ] Switch to the task branch: `git switch main && git pull --rebase origin main && git switch -c plan/app-i18n/phase-3/task-08-remaining-pages`
- [ ] Verify phase-3/task-07-users-sectors-dashboard `status.md` shows `complete`
- [ ] Check this task's `status.md` — must be `not-started`
- [ ] Enumerate all files in the six page directories before writing keys
- [ ] Review `common.*` in `pt.json` — reuse existing keys rather than duplicating
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Contacts/**/*.tsx` | modify | Replace strings with `t()` calls |
| `client/src/pages/Templates/**/*.tsx` | modify | Replace strings with `t()` calls |
| `client/src/pages/Triggers/**/*.tsx` | modify | Replace strings with `t()` calls |
| `client/src/pages/Messages/**/*.tsx` | modify | Replace strings with `t()` calls |
| `client/src/pages/Chat/**/*.tsx` | modify | Replace strings with `t()` calls |
| `client/src/pages/Reports/**/*.tsx` | modify | Replace strings with `t()` calls |
| `client/src/i18n/locales/pt.json` | modify | Append `contacts.*`, `templates.*`, `triggers.*`, `messages.*`, `chat.*`, `reports.*` |
| `client/src/i18n/locales/en.json` | modify | Append same sections with English values |

### Do NOT Modify

- Any file in previously completed tasks — all owned files are in the six page directories above

## Implementation Steps

### Step 1: Enumerate all files

```bash
find client/src/pages/Contacts client/src/pages/Templates client/src/pages/Triggers \
     client/src/pages/Messages client/src/pages/Chat client/src/pages/Reports \
     -name "*.tsx" | sort
```

Read each file. Build key lists per page namespace.

### Step 2: Apply translations (page by page)

Work through one page area at a time. For each component:
1. `import { useTranslation } from 'react-i18next'`
2. `const { t } = useTranslation()`
3. Replace hardcoded strings — use `common.*` for shared terms, page-specific keys for the rest

### Step 3: Update locale files

Append all six new sections to `pt.json` and `en.json`. Verify JSON validity.

### Step 4: Final audit — no hardcoded strings remain

```bash
grep -r "ção\|ões\|Salvar\|Cancelar\|Próximo\|Voltar\|Editar\|Excluir\|Novo\|Nova\|Buscar" \
  client/src --include="*.tsx" --include="*.ts" -l
```

Review every hit. Only locale JSON files should contain Portuguese text. Fix any remaining stragglers.

## Testing

- [ ] Run `npx vitest run client/src` — full client suite must pass
- [ ] Run the final audit grep — zero hits in `.tsx`/`.ts` files
- [ ] Manual: switch language to EN and browse all pages — verify every label is translated
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] After this task completes the full plan: run `document-solution` to capture the i18n setup pattern, LanguageSwitcher usage, Yup dynamic schema pattern, and language hydration flow for future reference
- [ ] Run `check-kb-index` after the KB doc is created

## Completion Criteria

- [ ] All six remaining page areas have zero hardcoded Portuguese strings
- [ ] `pt.json` and `en.json` have complete sections for all pages
- [ ] Final audit grep shows zero hits in `.tsx`/`.ts` files
- [ ] All client tests pass
- [ ] `document-solution` run and KB doc created for i18n pattern
- [ ] Changes committed to `plan/app-i18n/phase-3/task-08-remaining-pages`
- [ ] `status.md` updated to `complete`
- [ ] Plan `overview.md` status updated to `complete`

## Conflict Avoidance Notes

- This is the last task in the plan. After this task, open the single PR for the entire plan.
- Before opening the PR: rebase on `main` to pull any changes from the last few weeks of parallel development.
