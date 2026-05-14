# Plan: Security Hardening

**Status**: not-started
**Created**: 2026-05-14
**Last Updated**: 2026-05-14
**Estimated Demo Date**: N/A
**Assigned Dev**: Alan Costa Facchini
**Assigned QA**: unassigned

## Objective

Fix security issues identified in the OWASP-aligned security review (2026-05-14): unauthenticated Bull Board, no rate limiting, error leakage, missing headers, logging PII, missing RBAC, missing input validation, wrong JWT error code. CORS restriction follows an observe-first approach.

## Scope

### In Scope
- Helmet HTTP security headers
- CORS origin observability (log unknown origins), then restriction once allowlist is known
- Rate limiting on login endpoint
- Bull Board `/queue` authentication
- Error response sanitization (no stack traces)
- JWT verification 500 → 401 fix
- Role-based authorization on `/resources/users` and `/resources/licensees`
- Centralized logger: `LOG_LEVEL`-gated meta, PII out of info-level logs, Sentry integration
- Input validation on v1 API routes

### Out of Scope
- **API token migration away from query string** — `/api` routes are webhook receivers; external platforms call them and cannot set custom headers. The `?token=` pattern is standard for webhook authentication and is not a risk in this context.
- CSRF token implementation — API uses `x-access-token` header (not cookies); traditional CSRF risk is low
- Dependency vulnerability patching (Dependabot) — tracked separately via GitHub security alerts
- Adding express-validator to all existing routes beyond targeted v1 routes — scope creep; incremental approach preferred

## Kill Criteria

- If CORS observability (task-09 Phase A) reveals that restricting origins would affect more than 5 unknown external integrations, escalate before proceeding to Phase B

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Foundational Hardening | task-01, task-02, task-03, task-10 | None | Helmet, rate limiting, Bull Board auth, centralized logger (26 source files + 22 specs) |
| 2 | Route & Auth Hardening | task-05, task-07, task-08, task-09 | Phase 1 (task-05 depends on task-01) | Error response hardening, JWT/RBAC fixes, v1 input validation, CORS observability |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-helmet-cors | Helmet Security Headers | 1 | not-started | — |
| phase-1/task-02-rate-limiting | Rate Limiting on Login | 1 | not-started | — |
| phase-1/task-03-bull-board-auth | Bull Board Authentication | 1 | not-started | — |
| phase-1/task-10-centralized-logger | Centralized Logger | 1 | not-started | — |
| phase-2/task-05-error-response-hardening | Error Response Hardening | 2 | not-started | phase-1/task-01-helmet-cors |
| phase-2/task-07-jwt-rbac | JWT 500→401 Fix + RBAC on Resources Routes | 2 | not-started | — |
| phase-2/task-08-v1-input-validation | Input Validation on v1 API Routes | 2 | not-started | — |
| phase-2/task-09-cors-observability | CORS Origin Observability → Restriction | 2 | not-started | — |

## Branch Convention

Pattern: `plan/security-hardening/{task-path}`

Example branches:
- `plan/security-hardening/phase-1/task-01-helmet-cors`
- `plan/security-hardening/phase-2/task-07-jwt-rbac`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/config/http.js` | Express app setup — Helmet, error handler (task-01, task-05) |
| `src/config/cors.js` | CORS config — observability logging then restriction (task-09) |
| `src/app/routes/login-route.js` | Login endpoint — no rate limiting (task-02) |
| `src/app/routes/bull-board-route.js` | Bull Board router — no auth (task-03) |
| `src/config/routes.js` | Route mounting — `/queue` needs auth middleware (task-03) |
| `src/app/controllers/ChatbotsController.js` | Logs full `req.body` — fixed by task-10 (meta suppressed at info level) |
| `src/app/routes/resources-routes.js` | JWT verify returns 500; no RBAC on users/licensees (task-07) |
| `src/app/routes/v1/v1-routes.js` | No express-validator on any v1 route (task-08) |

## Risks

- task-08 (v1 input validation) — Strict validation may reject requests that currently pass. Mitigation: test with real payloads in staging before merging.
- task-09 Phase B (CORS restriction) — Unknown origins may exist. Mitigation: observability phase must complete before restriction is applied.

## Success Criteria

- [ ] `/queue` requires valid JWT to access
- [ ] Login endpoint returns 429 after configured threshold
- [ ] No stack traces or raw error objects returned to API callers
- [ ] JWT verification failure returns 401, not 500
- [ ] Helmet headers present on all responses
- [ ] All `console.*` calls replaced with centralized `logger`
- [ ] At `LOG_LEVEL=info` (default): no `req.body` or response payloads in logs
- [ ] At `LOG_LEVEL=debug`: full meta visible for investigation
- [ ] Sentry receives `error`/`fatal` exceptions when `SENTRY_DSN` is set
- [ ] `/resources/users` and `/resources/licensees` write operations restricted to super users
- [ ] v1 routes validate required inputs and return 422 on bad input
- [ ] CORS origin list is known and restriction is in place (Phase B of task-09)
- [ ] All existing tests pass
- [ ] No regressions in existing functionality

## References

- **JIRA Epic**: N/A
- **Weekly Plan Brief**: N/A
- **Related Plans**: None
- **Security Review Source**: OWASP-aligned audit — 2026-05-14
