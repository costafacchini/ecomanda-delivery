# Task: Navbar + BaseLayout + Shared Components i18n

**Plan**: App Internationalization (PT/EN)
**Phase**: 3
**Task ID (phase-local)**: task-05
**Task Path**: phase-3/task-05-navbar-layout
**Depends On**: phase-2/task-04-onboarding-i18n
**JIRA**: N/A

## Objective

Extract all hardcoded strings from the Navbar, BaseLayout, and any shared components (PrivateRoute, SimpleCrud, etc.) into `pt.json`/`en.json`. This task covers the persistent chrome of the app that every authenticated page displays.

## Context

The Navbar (`client/src/pages/Navbar/index.tsx`) contains navigation labels seen by all authenticated users. BaseLayout wraps every page. These are high-visibility strings that affect the entire authenticated experience.

Known strings in Navbar (verify by reading the file):
- Navigation items: "Dashboard", "Admin", "Licenciados", "Usuários", "Cadastros", "Contatos", "Setores", "Gatilhos", "Templates", "Mensagens", "Chat", "Relatórios"
- User menu items: logout text, user name area, role labels

Known strings in `routes.tsx` (already modified in task-03 for hydration — this task handles remaining strings):
- `<h1>Essa página não existe.</h1>` on the 404 catch-all route

Additionally, scan `client/src/components/` for any shared components with user-facing strings (e.g., a `Required` component that renders "obrigatório" or similar).

Read every file before writing keys — the survey list is a starting point.

## Before You Start

- [ ] Switch to the task branch: `git switch main && git pull --rebase origin main && git switch -c plan/app-i18n/phase-3/task-05-navbar-layout`
- [ ] Verify phase-2/task-04-onboarding-i18n `status.md` shows `complete`
- [ ] Check this task's `status.md` — must be `not-started`
- [ ] Read `client/src/pages/Navbar/index.tsx` in full
- [ ] Read `client/src/pages/BaseLayout/` files
- [ ] Scan `client/src/components/` for user-facing strings
- [ ] Read `client/src/pages/PrivateRoute/index.tsx`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Navbar/index.tsx` | modify | Replace strings with `t()` calls |
| `client/src/pages/BaseLayout/index.tsx` (or files inside) | modify | Replace strings with `t()` calls |
| `client/src/pages/routes.tsx` | modify | Replace the 404 `<h1>Essa página não existe.</h1>` |
| `client/src/components/` (any files with user strings) | modify | Replace strings with `t()` calls |
| `client/src/pages/PrivateRoute/index.tsx` | modify | Replace any hardcoded strings |
| `client/src/i18n/locales/pt.json` | modify | Append `navbar.*` and `common.*` keys |
| `client/src/i18n/locales/en.json` | modify | Append same keys with English values |

### Do NOT Modify

- Any file in `client/src/pages/Licensees/` — owned by phase-3/task-06-licensees
- Any file in `client/src/pages/Users/`, `Sectors/`, `Dashboard/` — owned by phase-3/task-07
- Any file in `client/src/pages/Contacts/`, `Templates/`, `Triggers/`, `Messages/`, `Chat/`, `Reports/` — owned by phase-3/task-08

## Implementation Steps

### Step 1: Audit all files in scope

Read each file and compile the full string list. Group under `navbar.*` and `common.*` namespaces.

Example `navbar` keys:
```json
{
  "navbar": {
    "dashboard": "Dashboard",
    "admin": "Admin",
    "licensees": "Licenciados",
    "users": "Usuários",
    "registrations": "Cadastros",
    "contacts": "Contatos",
    "sectors": "Setores",
    "triggers": "Gatilhos",
    "templates": "Templates",
    "messages": "Mensagens",
    "chat": "Chat",
    "reports": "Relatórios",
    "logout": "Sair",
    "notFound": "Essa página não existe."
  }
}
```

Add `common.*` keys for any cross-cutting strings (e.g., "Salvar", "Cancelar", "Confirmar", "Erro", "Sucesso") that will be reused across pages in tasks 06–08.

### Step 2: Update each file

For each file: `import { useTranslation } from 'react-i18next'`, add `const { t } = useTranslation()` inside the component, replace hardcoded strings with `t('namespace.key')`.

### Step 3: Update locale files

Append the new sections to `pt.json` and `en.json`. Confirm the files remain valid JSON after editing.

## Testing

- [ ] Run `npx vitest run client/src/pages/Navbar` — existing tests must pass
- [ ] Run `npx vitest run client/src` — full client suite must pass
- [ ] Manual: navigate the app authenticated and verify nav labels render in both PT and EN
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required for this task

## Completion Criteria

- [ ] Navbar, BaseLayout, PrivateRoute, and shared components have zero hardcoded strings
- [ ] `pt.json`/`en.json` have complete `navbar.*` and `common.*` sections
- [ ] All client tests pass
- [ ] Changes committed to `plan/app-i18n/phase-3/task-05-navbar-layout`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- Task-06 (licensees) depends on this task completing first. Locale files must be in a valid JSON state when committed.
- The `common.*` namespace defined here is shared across tasks 06–08. Define only genuinely cross-cutting keys here; page-specific keys belong in their own namespace.
