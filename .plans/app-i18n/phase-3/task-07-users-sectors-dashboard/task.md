# Task: Users + Sectors + Dashboard i18n

**Plan**: App Internationalization (PT/EN)
**Phase**: 3
**Task ID (phase-local)**: task-07
**Task Path**: phase-3/task-07-users-sectors-dashboard
**Depends On**: phase-3/task-06-licensees
**JIRA**: N/A

## Objective

Extract all hardcoded strings from the Users, Sectors, and Dashboard pages into `pt.json`/`en.json` under their respective namespaces.

## Context

Three distinct page areas:

**Users** (`client/src/pages/Users/`):
- Likely has Index (list), New (create form), Edit forms
- Form fields: name, email, password, role (enum labels), active toggle
- Role enum labels ("Agente", "Supervisor", "Admin", "Super") need translations

**Sectors** (`client/src/pages/Sectors/`):
- Similar CRUD structure: Index, Form scenes
- Fields specific to sectors (e.g., name, whatsapp number assignments)

**Dashboard** (`client/src/pages/Dashboard/index.tsx`):
- Summary cards with counts and labels
- Role-aware — may show different labels based on user role

Run `find client/src/pages/Users client/src/pages/Sectors client/src/pages/Dashboard -name "*.tsx" | sort` to enumerate all files before starting.

**common.* reuse**: Use `t('common.save')`, `t('common.cancel')`, `t('common.active')`, `t('common.name')`, `t('common.email')` etc. for strings already in the common namespace from task-05. Only add page-specific keys to the page namespace.

## Before You Start

- [ ] Switch to the task branch: `git switch main && git pull --rebase origin main && git switch -c plan/app-i18n/phase-3/task-07-users-sectors-dashboard`
- [ ] Verify phase-3/task-06-licensees `status.md` shows `complete`
- [ ] Check this task's `status.md` — must be `not-started`
- [ ] Enumerate and read all files in Users, Sectors, and Dashboard before writing keys
- [ ] Check `common.*` in `pt.json` to avoid duplicating already-defined keys
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Users/**/*.tsx` | modify | Replace strings with `t()` calls |
| `client/src/pages/Sectors/**/*.tsx` | modify | Replace strings with `t()` calls |
| `client/src/pages/Dashboard/**/*.tsx` | modify | Replace strings with `t()` calls |
| `client/src/i18n/locales/pt.json` | modify | Append `users.*`, `sectors.*`, `dashboard.*` keys |
| `client/src/i18n/locales/en.json` | modify | Append same keys with English values |

### Do NOT Modify

- `client/src/pages/Licensees/` — owned by phase-3/task-06 (complete)
- `client/src/pages/Contacts/`, `Templates/`, `Triggers/`, `Messages/`, `Chat/`, `Reports/` — owned by task-08

## Implementation Steps

### Step 1: Enumerate and audit

```bash
find client/src/pages/Users client/src/pages/Sectors client/src/pages/Dashboard -name "*.tsx" | sort
```

Read each file. Build key lists. Group under `users.*`, `sectors.*`, `dashboard.*`.

### Step 2: Apply translations

For each component file: add `useTranslation()`, replace strings with `t()` calls, reuse `common.*` keys where applicable.

### Step 3: Update locale files

Append the three new sections to `pt.json` and `en.json`. Verify JSON validity after editing.

## Testing

- [ ] Run `npx vitest run client/src/pages/Users client/src/pages/Sectors client/src/pages/Dashboard` — all tests must pass
- [ ] Run `npx vitest run client/src` — full suite must pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required for this task

## Completion Criteria

- [ ] All files in Users, Sectors, and Dashboard have zero hardcoded Portuguese strings
- [ ] `pt.json`/`en.json` have `users.*`, `sectors.*`, `dashboard.*` sections
- [ ] All client tests pass
- [ ] Changes committed to `plan/app-i18n/phase-3/task-07-users-sectors-dashboard`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- Task-08 depends on this task. Commit locale files in valid JSON state.
