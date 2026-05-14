# Plan: Security Hardening

**Status**: not-started
**Created**: 2026-05-14
**Last Updated**: 2026-05-14
**Estimated Demo Date**: N/A
**Assigned Dev**: Alan Costa Facchini
**Assigned QA**: unassigned

## Objective

Fix the 10 security issues identified in the OWASP-aligned security review: four blocking issues (unauthenticated Bull Board, no rate limiting, token in query string, error leakage) and six warnings (missing headers, permissive CORS, logging PII, missing RBAC, missing input validation, wrong JWT error code).

## Scope

### In Scope
- Helmet HTTP security headers
- CORS origin restriction
- Rate limiting on login endpoint
- Bull Board `/queue` authentication
- Error response sanitization (no stack traces)
- JWT verification 500 → 401 fix
- API token migration from query string to `Authorization` header
- Role-based authorization on `/resources/users` and `/resources/licensees`
- `req.body` logging sanitization in `ChatbotsController`
- Input validation on v1 API routes

### Out of Scope
- CSRF token implementation — API uses `x-access-token` header (not cookies); traditional CSRF risk is low
- Dependency vulnerability patching (Dependabot) — tracked separately via GitHub security alerts
- Adding express-validator to all existing routes beyond v1 — scope creep; incremental approach preferred

## Kill Criteria
- If the API token migration (task-06) would require coordinated changes to all external integrations before a cutover date, pause and design a deprecation window first

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Foundational Hardening | task-01 through task-04 | None | Low-risk, independent fixes: Helmet, CORS, rate limiting, Bull Board auth, logging sanitization |
| 2 | Route & Auth Hardening | task-05 through task-08 | Phase 1 | Error response hardening (builds on task-01's http.js changes), API token migration, JWT/RBAC fixes, v1 input validation |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-helmet-cors | Helmet Headers + CORS Restriction | 1 | not-started | — |
| phase-1/task-02-rate-limiting | Rate Limiting on Login | 1 | not-started | — |
| phase-1/task-03-bull-board-auth | Bull Board Authentication | 1 | not-started | — |
| phase-1/task-04-sanitize-logging | Sanitize ChatbotsController Logging | 1 | not-started | — |
| phase-2/task-05-error-response-hardening | Error Response Hardening | 2 | not-started | phase-1/task-01-helmet-cors |
| phase-2/task-06-api-token-header | API Token: Query String → Authorization Header | 2 | not-started | — |
| phase-2/task-07-jwt-rbac | JWT 500→401 Fix + RBAC on Resources Routes | 2 | not-started | — |
| phase-2/task-08-v1-input-validation | Input Validation on v1 API Routes | 2 | not-started | — |

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
| `src/config/cors.js` | CORS config — currently allows all origins (task-01) |
| `src/app/routes/login-route.js` | Login endpoint — no rate limiting (task-02) |
| `src/app/routes/bull-board-route.js` | Bull Board router — no auth (task-03) |
| `src/config/routes.js` | Route mounting — `/queue` needs auth middleware (task-03) |
| `src/app/controllers/ChatbotsController.js` | Logs full `req.body` (task-04) |
| `src/app/routes/api-routes.js` | Token read from `req.query.token` (task-06) |
| `src/app/routes/resources-routes.js` | JWT verify returns 500; no RBAC on users/licensees (task-07) |
| `src/app/routes/v1/v1-routes.js` | No express-validator on any v1 route (task-08) |

## Risks

- task-06 (API token migration) — External integrations send `?token=` today. Changing to `Authorization` header is a breaking change. Mitigation: support both during a transition window, then remove query param.
- task-08 (v1 input validation) — Strict validation may reject requests that currently pass. Mitigation: test with real payloads in staging before merging.

## Success Criteria

- [ ] `/queue` requires valid JWT to access
- [ ] Login endpoint returns 429 after configured threshold
- [ ] No stack traces or raw error objects returned to API callers
- [ ] JWT verification failure returns 401, not 500
- [ ] CORS restricted to `ALLOWED_ORIGINS` env var in non-development environments
- [ ] Helmet headers present on all responses
- [ ] ChatbotsController no longer logs `req.body` verbatim
- [ ] API token accepted from `Authorization: Bearer <token>` header
- [ ] `/resources/users` and `/resources/licensees` write operations restricted to super users
- [ ] v1 routes validate required inputs and return 400 on bad input
- [ ] All existing tests pass
- [ ] No regressions in existing functionality

## References

- **JIRA Epic**: N/A
- **Weekly Plan Brief**: N/A
- **Related Plans**: None
- **Security Review Source**: OWASP-aligned audit — 2026-05-14
