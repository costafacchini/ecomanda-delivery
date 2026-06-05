# Plan: Onboarding Wizard

**Status**: not-started
**Created**: 2026-06-05
**Last Updated**: 2026-06-05
**Estimated Demo Date**: TBD
**Assigned Dev**: Alan Costa Facchini
**Assigned QA**: unassigned

## Objective

Add a public self-service onboarding flow reachable from the login screen. A "Criar conta" link opens a multi-step wizard modal over the login background; the user fills in licensee identity, chooses optional chat/WhatsApp integrations, configures chosen integrations, and finally sets their own credentials. The backend creates both records in a single public endpoint and the user is redirected to login.

## Scope

### In Scope
- Public `POST /onboarding` backend endpoint (no auth required, rate-limited) that creates a Licensee and an admin User in one request — accepts licensee identity fields + optional chat/WhatsApp integration fields + user credentials
- `OnboardAccount` use case with cleanup if user creation fails after licensee creation
- `OnboardingController` wired directly into `login-route.ts`
- `OnboardingModal.tsx` — dynamic multi-step wizard modal:
  - Step 1: Licensee identity (name, kind, document, email, phone)
  - Step 2: Integration choices — two YesNo gates on same screen (Chat platform? / WhatsApp platform?)
  - Step 3 (conditional): Chat platform fields — shown only if user chose "Sim" for chat
  - Step 4 (conditional): WhatsApp platform fields — shown only if user chose "Sim" for WhatsApp
  - Step 5 (always last): User credentials (name, email, password, confirmPassword)
- `onboarding.ts` frontend service calling the public endpoint
- "Criar conta" link on the Sign-In page that opens the modal
- On success: modal closes and user lands on the login form with a success banner

### Out of Scope
- ChatBot integration step — out of scope for onboarding (admin can configure post-signup)
- `licenseKind` is locked to `'demo'` server-side; not shown in wizard — plan/upgrade is future work
- Email verification flow — out of scope for this iteration
- Any modification to existing `POST /licensees` or `POST /users` protected routes

## Kill Criteria

- If the team decides to require email verification before creating the account, halt and re-plan
- If `POST /onboarding` is determined to require multi-tenant isolation logic not present in the current schema

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Backend | task-01 | None | Public use case, controller, and route for combined licensee+user creation |
| 2 | Frontend Modal | task-02 | Phase 1 | Dynamic multi-step wizard component + API service layer |
| 3 | Sign-in Integration | task-03 | Phase 2 | Wire the modal into the Sign-in page |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-backend-onboarding-endpoint | Backend Onboarding Endpoint | 1 | complete | — |
| phase-2/task-02-onboarding-modal | Onboarding Modal Component | 2 | complete | phase-1/task-01-backend-onboarding-endpoint |
| phase-3/task-03-signin-integration | Sign-in Page Integration | 3 | not-started | phase-2/task-02-onboarding-modal |

## Branch Convention

Pattern: `plan/onboarding-wizard/{task-path}`

Example branches:
- `plan/onboarding-wizard/phase-1/task-01-backend-onboarding-endpoint`
- `plan/onboarding-wizard/phase-2/task-02-onboarding-modal`
- `plan/onboarding-wizard/phase-3/task-03-signin-integration`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/app/routes/login-route.ts` | Public router — add `POST /onboarding` here (same public boundary as login) |
| `src/app/usecases/licensees/CreateLicensee.ts` | Reference for `pickFields` helper and field whitelist pattern |
| `src/app/models/Licensee.ts` | Field constraints: name ≥4, licenseKind enum, chatDefault enum, whatsappDefault enum, conditional token/url requirements |
| `src/app/models/User.ts` | Required: name ≥4, email (unique), password ≥8; role=admin makes licensee optional |
| `client/src/pages/SignIn/index.tsx` | Login page — add "Criar conta" link + mount modal |
| `client/src/pages/Licensees/scenes/New/LicenseeWizard.tsx` | Reference for YesNoGate component, step progression, Formik + Yup per-step validation pattern |
| `client/src/pages/Licensees/scenes/Form/panels/ChatPanel.tsx` | Reference for chat field set (chatDefault, chatUrl, chatIdentifier, chatKey) |
| `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.tsx` | Reference for WhatsApp field set (whatsappDefault, whatsappToken, whatsappUrl) |
| `client/src/components/SelectLicenseeModal/index.tsx` | Reference for Bootstrap modal HTML pattern |
| `client/src/services/licensee.ts` | Reference for frontend service pattern (api() wrapper) |

## Risks

- `POST /onboarding` is unauthenticated — rate limiting is mandatory; reuse the loginLimiter pattern from `login-route.ts` with a tighter window (5 per hour)
- User email uniqueness — duplicate email must surface as a 409 inline in the wizard
- Licensee orphan on partial failure — if licensee creation succeeds but user creation fails, the use case must delete the orphaned licensee before returning an error
- Dynamic step sequence — skipping integration steps based on yes/no choices requires careful "next/previous" logic; use a computed `steps` array derived from `wantsChat`/`wantsWhatsapp` state

## Success Criteria

- [ ] `POST /onboarding` creates a Licensee and linked admin User; returns 201 with `{ licensee, user }` (password excluded)
- [ ] `POST /onboarding` is rate-limited and requires no auth token
- [ ] Wizard modal renders over the login gradient background, not a separate page
- [ ] Step 1 collects licensee identity (name, kind, document, email, phone)
- [ ] Step 2 shows two YesNo gates (Chat / WhatsApp); choosing "Não" for both skips directly to user credentials
- [ ] Steps 3/4 appear only when the user chose "Sim" for the respective integration
- [ ] Last step always collects user credentials (name, email, password, confirmPassword)
- [ ] On success: modal closes, Sign-in page shows a success message
- [ ] On failure: wizard displays the server error message inline
- [ ] All new backend specs pass (`npx jest`)
- [ ] All new frontend specs pass (`npx vitest`)
- [ ] `pre-commit-check` passes on all three task branches
- [ ] No regressions in existing functionality

## References

- **JIRA Epic**: N/A
- **Weekly Plan Brief**: N/A
- **Related Plans**: None
- **Rock Alignment**: N/A
