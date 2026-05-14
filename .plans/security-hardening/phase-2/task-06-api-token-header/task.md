# Task: API Token — Query String → Authorization Header

**Plan**: Security Hardening
**Phase**: 2
**Task ID (phase-local)**: task-06
**Task Path**: phase-2/task-06-api-token-header
**Depends On**: None
**JIRA**: N/A

## Objective

Stop accepting the licensee API token from `req.query.token` (which gets logged in access logs and exposed in referrer headers) and accept it from the `Authorization: Bearer <token>` header instead. Support both during a transition window, then deprecate the query string.

## Context

`src/app/routes/api-routes.js` line 10: `if (req.query.token)` — reads the API token from the URL query string. Tokens in query strings are logged by Morgan and proxies, and appear in browser history and `Referer` headers.

The correct pattern is `Authorization: Bearer <token>`. The middleware should:
1. First check `Authorization: Bearer <token>` header
2. Fall back to `req.query.token` with a deprecation warning log
3. Return 401 if neither is present

This dual-support approach allows external integrations to migrate without a hard cutover. The query string fallback can be removed in a future cleanup task once all callers have migrated.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Search for existing tests for `api-routes.js` or `authenticateLicensee`: `grep -rn "authenticateLicensee\|api-routes" src/__tests__/`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/routes/api-routes.js` | modify | Add Bearer token support; keep query fallback with deprecation log |

### Do NOT Modify

- `src/config/http.js` — owned by task-05
- `src/app/routes/resources-routes.js` — owned by task-07
- `src/app/routes/v1/v1-routes.js` — owned by task-08

## Implementation Steps

### Step 1: Update authenticateLicensee in src/app/routes/api-routes.js

```js
function buildAuthenticateLicensee({ licenseeRepository }) {
  return async function authenticateLicensee(req, res, next) {
    let token = null

    // Preferred: Authorization: Bearer <token>
    const authHeader = req.headers['authorization']
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    }

    // Deprecated: ?token=<token> — supported for backwards compatibility
    if (!token && req.query.token) {
      console.warn('API token passed via query string is deprecated. Use Authorization: Bearer <token>')
      token = req.query.token
    }

    if (token) {
      const licensee = await licenseeRepository.findFirst({ apiToken: token })
      if (licensee) {
        req.licensee = licensee
        return next()
      }
    }

    res.status(401).json({ message: 'Token não informado ou inválido.' })
  }
}
```

## Testing

- [ ] `npx jest` — all existing tests pass
- [ ] Write or update tests for the `authenticateLicensee` middleware to cover:
  - Valid `Authorization: Bearer <token>` → passes through
  - Valid `?token=<token>` → passes through (with deprecation log)
  - Missing both → 401
  - Invalid token in either position → 401
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] After merge, communicate to integration partners that `?token=` is deprecated and will be removed in a future release
- [ ] No KB doc required — decision rationale is captured in task.md and commit message

## Completion Criteria

- [ ] `Authorization: Bearer` is the primary token mechanism
- [ ] `?token=` still works with a deprecation warning logged
- [ ] Missing / invalid token returns 401
- [ ] Tests cover all three scenarios
- [ ] Changes committed to `plan/security-hardening/phase-2/task-06-api-token-header`
- [ ] `status.md` updated to `complete`
