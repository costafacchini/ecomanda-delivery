# Plan: App Internationalization (PT/EN)

**Status**: complete
**Created**: 2026-06-24
**Last Updated**: 2026-06-24
**Assigned Dev**: Alan Costa Facchini
**PR Strategy**: single

## Objective

Add Portuguese/English language selection throughout the app. Users choose their language on the login page (persisted in localStorage) and during onboarding (persisted in the User document); after login the app renders in the user's saved language. Every hardcoded string in the frontend is externalized to translation files.

## Scope

### In Scope
- Install `react-i18next` + `i18next` on the client
- `client/src/i18n/` — locale files (`pt.json`, `en.json`), i18next config, `LanguageSwitcher` component
- `IUser.language` field — type, backend model, OnboardingController
- MongoDB migration script to backfill `language: 'pt'` on existing users
- Language switcher on login page (persisted to localStorage)
- Language switcher on onboarding wizard (sent in POST /login/onboarding payload)
- Post-login language hydration: call `i18n.changeLanguage(user.language)` after `fetchLoggedUser()` in both `SignIn/index.tsx` and `routes.tsx`
- All user-facing strings in `client/src/`: labels, placeholders, error messages, validation errors, nav items, empty states

### Out of Scope
- Backend i18n (error messages remain in English/neutral; frontend maps keys to human-readable text in pt.json/en.json)
- Languages beyond Portuguese and English — enum is `'pt' | 'en'` only for this plan
- Email templates or external notification strings
- Admin-only routes in Express (backend API responses, not end-user text)

## Kill Criteria
- If `react-i18next` or `i18next` ships a breaking API change before this plan completes that would invalidate the wiring approach
- If a decision is made to adopt a full server-side rendering strategy that changes how i18n is initialized client-side

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Infrastructure | task-01, task-02 | None | i18n client setup + backend language field (parallel) |
| 2 | Public Entry Points | task-03, task-04 | Phase 1 | Login page + onboarding wizard (sequential — both write to locale files) |
| 3 | Full App Translation | task-05 → task-09 | Phase 2 | Navbar, all authenticated pages, chat widget (task-05→08 sequential chain; task-09 independent) |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-i18n-setup | i18n Client Infrastructure | 1 | not-started | — |
| phase-1/task-02-user-model-backend | User Model Language Field + Migration Script | 1 | not-started | — |
| phase-2/task-03-login-i18n | Login Page i18n + Language Switcher | 2 | not-started | phase-1/task-01-i18n-setup, phase-1/task-02-user-model-backend |
| phase-2/task-04-onboarding-i18n | Onboarding Wizard i18n + Language Switcher | 2 | not-started | phase-2/task-03-login-i18n |
| phase-3/task-05-navbar-layout | Navbar + BaseLayout i18n | 3 | not-started | phase-2/task-04-onboarding-i18n |
| phase-3/task-06-licensees | Licensees Pages i18n | 3 | not-started | phase-3/task-05-navbar-layout |
| phase-3/task-07-users-sectors-dashboard | Users + Sectors + Dashboard i18n | 3 | not-started | phase-3/task-06-licensees |
| phase-3/task-08-remaining-pages | Contacts + Templates + Triggers + Messages + Chat + Reports i18n | 3 | not-started | phase-3/task-07-users-sectors-dashboard |
| phase-3/task-09-widget-i18n | Chat Widget i18n (translations map + language prop threading) | 3 | not-started | phase-1/task-01-i18n-setup |

> **Note on phase-3 sequencing**: Tasks 05–08 form a sequential chain because all of them append to `pt.json` and `en.json` — they cannot run in parallel. Task-09 is independent (owns only `widget/src/`) and can run alongside any of tasks 05–08.

## Branch Convention

Pattern: `plan/app-i18n/{task-path}`

Example branches:
- `plan/app-i18n/phase-1/task-01-i18n-setup`
- `plan/app-i18n/phase-2/task-03-login-i18n`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `client/src/i18n/` | New directory — i18next config + locale files (created in task-01) |
| `client/src/i18n/locales/pt.json` | Portuguese translations — ALL tasks in phases 2-3 append to this file |
| `client/src/i18n/locales/en.json` | English translations — ALL tasks in phases 2-3 append to this file |
| `client/src/components/LanguageSwitcher/index.tsx` | Reusable PT/EN toggle (created in task-01, consumed in task-03 + task-04) |
| `client/src/index.tsx` | App entry — wrap with `I18nextProvider` (task-01) |
| `client/src/types/user.ts` | Add `language: 'pt' \| 'en'` to `IUser` (task-01) |
| `client/src/pages/routes.tsx` | Language hydration on session restore (task-03) |
| `client/src/pages/SignIn/index.tsx` | Login page — strings + language switcher + post-login hydration (task-03) |
| `client/src/pages/SignIn/OnboardingModal.tsx` | Onboarding — strings + Yup schemas + switcher + language payload (task-04) |
| `src/app/models/User.ts` | Add `language` field (task-02) |
| `src/app/controllers/OnboardingController.ts` | Accept + persist `language` in POST /login/onboarding (task-02) |
| `scripts/migrate-user-language.js` | MongoDB shell script — backfill `language: 'pt'` (task-02) |
| `widget/src/translations.ts` | New file — lightweight `{ pt, en }` string map (no react-i18next) — task-09 |
| `widget/src/main.tsx` | Add `language` to `InitData`, read `data-language` from script tag — task-09 |

## Risks

- **Yup schemas are static** — Yup validation error messages are created once at module level. To make them react to language changes, schemas must be recreated inside the component or via a factory function called with `t`. Mitigation: use `useMemo(() => buildSchema(t), [t])` pattern in OnboardingModal.
- **Locale file merge conflicts** — Multiple phase-3 tasks all append to the same `pt.json`/`en.json`. Mitigation: tasks are sequenced, each completing before the next starts.
- **Session restore language** — `routes.tsx` calls `fetchLoggedUser()` on mount; if the user refreshes mid-session, i18n must re-apply `user.language`. Mitigation: task-03 adds the `i18n.changeLanguage(user.language)` call in the `routes.tsx` effect.
- **Existing tests** — OnboardingModal tests use static Yup snapshots; if schemas become dynamic, specs may need updating. Mitigation: task-04 owns the spec update.

## Success Criteria

- [ ] Language switcher visible and functional on login page (localStorage-persisted)
- [ ] Language switcher visible and functional on onboarding wizard
- [ ] Onboarding submits selected language; `user.language` is stored in MongoDB
- [ ] After login, the app renders in the language stored in `user.language`
- [ ] After page refresh (session restore), language is correctly re-applied
- [ ] All user-facing strings across the app are translated in both `pt.json` and `en.json`
- [ ] No hardcoded Portuguese strings remain in `client/src/`
- [ ] MongoDB migration script provided and documented
- [ ] Chat widget renders in PT/EN via `data-language` and `EcomandaWidget.init({ language })`
- [ ] No i18n library added to `widget/package.json`
- [ ] All pre-existing Vitest tests pass
- [ ] New i18n logic and LanguageSwitcher component have test coverage
- [ ] `pre-commit-check` passes on final commit

## References

- **JIRA Epic**: N/A
- **Weekly Plan Brief**: N/A
- **Related Plans**: [Onboarding Wizard](../onboarding-wizard/overview.md) (prerequisite — completed 2026-06-05)
- **Rock Alignment**: N/A
