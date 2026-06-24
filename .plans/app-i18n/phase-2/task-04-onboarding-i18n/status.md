# Status: Onboarding Wizard i18n + Language Switcher

**Current Status**: complete
**Last Updated**: 2026-06-24
**Agent**: claude-sonnet-4-6
**Branch**: plan/app-i18n-phase-2-task-04-onboarding-i18n
**PR**: —

## Status History

| Timestamp | Status | Agent | Notes |
|-----------|--------|-------|-------|
| 2026-06-24 | not-started | — | Task created |
| 2026-06-24 | in-progress | claude-sonnet-4-6 | Implementing onboarding i18n + LanguageSwitcher + language in payload |
| 2026-06-24 | complete | claude-sonnet-4-6 | All files implemented, 316 tests pass |

## Blockers

None

## Artifacts

- `client/src/pages/SignIn/OnboardingModal.tsx` — all PT strings replaced with t(), dynamic Yup schemas via useMemo, LanguageSwitcher added to modal header, language sent in POST payload
- `client/src/pages/SignIn/OnboardingModal.spec.tsx` — react-i18next mock added, label selectors updated to translation keys, new tests for language payload and LanguageSwitcher
- `client/src/i18n/locales/pt.json` — onboarding.* section populated (87 keys)
- `client/src/i18n/locales/en.json` — onboarding.* section populated (87 keys)
- `client/src/services/onboarding.ts` — added language field; fixed useSetores typo to useSectors

## Adaptations

None
