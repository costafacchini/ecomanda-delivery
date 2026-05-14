# Task: Helmet Security Headers

**Plan**: Security Hardening
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-helmet-cors
**Depends On**: None
**JIRA**: N/A

## Objective

Add Helmet HTTP security headers to all responses. CORS restriction is deferred — see `phase-2/task-09-cors-observability`.

## Context

`src/config/http.js` sets up the Express app. There are currently no security headers (no CSP, no X-Frame-Options, no HSTS, etc.).

Helmet is the standard Express middleware for setting secure HTTP headers. It should be applied as the first middleware in the chain, before `express.json()`.

**CORS is intentionally not touched here.** We don't know which origins are currently sending requests (some are webhook callers with no `Origin` header at all), so restricting CORS without prior observation could silently break integrations. See `task-09-cors-observability` for the safe path.

Note: `task-05-error-response-hardening` in phase 2 also modifies `src/config/http.js` — it depends on this task completing first.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Check no other branch is currently modifying `src/config/http.js`
- [ ] Look up current Helmet version: `npm show helmet version`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/config/http.js` | modify | Add `helmet()` middleware early in chain |
| `package.json` | modify | Add helmet dependency |
| `yarn.lock` | modify | Updated by yarn |

### Do NOT Modify

- `src/config/cors.js` — not in scope for this task; CORS deferred to task-09
- `src/app/routes/login-route.js` — owned by task-02
- `src/app/routes/bull-board-route.js` — owned by task-03
- `src/config/routes.js` — owned by task-03
- `src/app/controllers/ChatbotsController.js` — owned by task-04

## Implementation Steps

### Step 1: Install Helmet

```bash
npm show helmet version   # get latest version
yarn add helmet@<version>
```

### Step 2: Update src/config/http.js

Add `import helmet from 'helmet'` and apply it as the first middleware, before `express.json()`:

```js
import helmet from 'helmet'
// ...
app.use(helmet())
app.use(express.json({ limit: '50mb' }))
```

## Testing

- [ ] `npx jest` — all existing tests pass
- [ ] Start the dev server (`yarn run dev`) and confirm security headers appear: `curl -I http://localhost:PORT/`
- [ ] Confirm `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security` are present in the response
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc required — standard Helmet setup

## Completion Criteria

- [ ] Helmet middleware applied as the first middleware in `http.js`
- [ ] All tests pass
- [ ] Changes committed to `plan/security-hardening/phase-1/task-01-helmet-cors`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- `task-05-error-response-hardening` (phase 2) also modifies `src/config/http.js`. It must branch from the merged output of this task.
- `task-09-cors-observability` (phase 2) owns `src/config/cors.js` — do not touch that file here.
