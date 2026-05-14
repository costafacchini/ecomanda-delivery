# Task: Helmet Headers + CORS Restriction

**Plan**: Security Hardening
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-helmet-cors
**Depends On**: None
**JIRA**: N/A

## Objective

Add Helmet HTTP security headers and restrict CORS to a configurable list of allowed origins, replacing the current open `cors()` call.

## Context

`src/config/http.js` sets up the Express app. Currently there are no security headers and CORS is configured as `cors()` with no options (allows all origins).

`src/config/cors.js` exports `enableCors(app)` which calls `app.use(cors())`. This needs to read from `process.env.ALLOWED_ORIGINS` (comma-separated) and fall back to `*` only in development.

Helmet is the standard Express security headers middleware (sets CSP, X-Frame-Options, HSTS, X-Content-Type-Options, etc.). Install it and apply it early in the middleware chain in `src/config/http.js`.

Note: `task-05-error-response-hardening` in phase 2 also modifies `src/config/http.js` — it depends on this task completing first.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Check no other branch is currently modifying `src/config/cors.js` or `src/config/http.js`
- [ ] Look up current Helmet version: `npm show helmet version`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/config/cors.js` | modify | Add origin allowlist from env var |
| `src/config/http.js` | modify | Add `helmet()` middleware early in chain |
| `package.json` | modify | Add helmet dependency |
| `yarn.lock` | modify | Updated by yarn |

### Do NOT Modify

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

### Step 3: Update src/config/cors.js

Read allowed origins from the environment. In development fall back to all origins:

```js
import cors from 'cors'

function enableCors(app) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : null

  const corsOptions = allowedOrigins
    ? { origin: allowedOrigins, credentials: true }
    : {} // open in dev (no ALLOWED_ORIGINS set)

  app.use(cors(corsOptions))
}

export { enableCors }
```

### Step 4: Document the new env var

Add `ALLOWED_ORIGINS` to any `.env.example` or environment documentation if it exists in the project.

## Testing

- [ ] `npx jest` — all existing tests pass
- [ ] Start the dev server (`yarn run dev`) and confirm security headers appear (use `curl -I http://localhost:PORT/`)
- [ ] Confirm `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security` are present
- [ ] Confirm a request from an unlisted origin is rejected when `ALLOWED_ORIGINS` is set
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] If a `.env.example` exists, add `ALLOWED_ORIGINS=` entry
- [ ] No KB doc required — standard Helmet/CORS setup is well-documented externally

## Completion Criteria

- [ ] Helmet middleware applied before other middleware in `http.js`
- [ ] CORS reads from `ALLOWED_ORIGINS` env var; falls back to open in dev
- [ ] All tests pass
- [ ] Changes committed to `plan/security-hardening/phase-1/task-01-helmet-cors`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- `task-05-error-response-hardening` (phase 2) also modifies `src/config/http.js`. It must branch from the merged output of this task.
