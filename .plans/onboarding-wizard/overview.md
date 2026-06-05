# Plan: Onboarding Wizard

**Status**: not-started
**Created**: 2026-06-05
**Last Updated**: 2026-06-05
**Estimated Demo Date**: TBD
**Assigned Dev**: Alan Costa Facchini
**Assigned QA**: unassigned

## Objective

Add a public self-service onboarding flow reachable from the login screen. A "Create your account" link opens a multi-step wizard modal over the login background; the user fills in licensee identity info and their own credentials, the backend creates both records in a single public endpoint, and the user is redirected to login to access the platform.

## Scope

### In Scope
- Public `POST /onboarding` backend endpoint (no auth required, rate-limited) that creates a Licensee and an admin User in one request
- `OnboardAccount` use case with cleanup if user creation fails after licensee creation
- `OnboardingController` wired directly into `login-route.ts`
- `OnboardingModal.tsx` — multi-step Bootstrap modal (Step 1: licensee identity; Step 2: user credentials)
- `onboarding.ts` frontend service calling the public endpoint
- "Criar conta" link on the Sign-In page that opens the modal
- On success: modal closes and user lands on the login form with a success banner

### Out of Scope
- Integration (chat/chatbot/WhatsApp/cart/PagarMe/Pedidos10) wizard steps — those require admin configuration post-signup; excluded to keep onboarding minimal
- Email verification flow — out of scope for this iteration
- `licenseKind` locked to `'demo'` server-side — the frontend shows it as a read-only "Demo" label; plan/upgrade flow is future work
- Any modification to existing `POST /licensees` or `POST /users` protected routes

## Kill Criteria

- If the team decides to require email verification before creating the account, halt and re-plan
- If `POST /onboarding` is determined to require multi-tenant isolation logic not present in the current schema

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Backend | task-01 | None | Public use case, controller, and route for combined licensee+user creation |
| 2 | Frontend Modal | task-02 | Phase 1 | Multi-step wizard component + API service layer |
| 3 | Sign-in Integration | task-03 | Phase 2 | Wire the modal into the Sign-in page |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-backend-onboarding-endpoint | Backend Onboarding Endpoint | 1 | not-started | — |
| phase-2/task-02-onboarding-modal | Onboarding Modal Component | 2 | not-started | phase-1/task-01-backend-onboarding-endpoint |
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
| `src/app/usecases/licensees/CreateLicensee.ts` | Reference for field whitelist and `pickFields` helper pattern |
| `src/app/usecases/users/CreateUser.ts` | Reference for user creation pattern |
| `src/app/models/Licensee.ts` | Required fields: name (≥4), licenseKind (demo/free/paid), email, phone, document, kind (individual/company) |
| `src/app/models/User.ts` | Required fields: name (≥4), email (unique), password (≥8); `licensee` optional when role=admin |
| `client/src/pages/SignIn/index.tsx` | Login page — add "Criar conta" link + mount modal |
| `client/src/pages/Licensees/scenes/New/LicenseeWizard.tsx` | Reference for wizard step structure, Formik setup, and field names |
| `client/src/components/SelectLicenseeModal/index.tsx` | Reference for Bootstrap modal HTML pattern used in this codebase |
| `client/src/services/licensee.ts` | Reference for frontend service pattern (api() wrapper, headers) |

## Risks

- `POST /onboarding` is unauthenticated — rate limiting is mandatory to prevent account spam; reuse the loginLimiter pattern from `login-route.ts`
- User email uniqueness — if signup is attempted with an already-registered email, the backend must return a clear 409 error surfaced in the wizard
- Licensee orphan on partial failure — if licensee creation succeeds but user creation fails, the use case must delete the orphaned licensee before returning an error

## Success Criteria

- [ ] `POST /onboarding` creates a Licensee and linked admin User; returns 201 with `{ licensee, user }` (password excluded)
- [ ] `POST /onboarding` is rate-limited and requires no auth token
- [ ] Wizard modal renders over the login gradient background, not a separate page
- [ ] Step 1 collects: name, kind, document, email, phone (licenseKind fixed to 'demo' server-side, shown as read-only in UI)
- [ ] Step 2 collects: user name, email, password, confirmPassword (confirmPassword is frontend-only)
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
