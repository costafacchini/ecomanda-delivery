# Task: CORS Origin Observability → Restriction

**Plan**: Security Hardening
**Phase**: 2
**Task ID (phase-local)**: task-09
**Task Path**: phase-2/task-09-cors-observability
**Depends On**: None
**JIRA**: N/A

## Objective

Understand which origins are currently sending requests to the API before restricting CORS, then configure an allowlist based on observed real traffic.

## Context

`src/config/cors.js` currently calls `cors()` with no options, allowing all origins. We want to restrict this — but many callers are webhooks from external platforms that may send requests with or without an `Origin` header. Restricting blindly could silently break integrations.

**This task has two phases of work:**

### Phase A — Observability (deploy first, observe for N days)
Add origin logging middleware to `src/config/cors.js` so that every unique `req.headers.origin` is logged to the console. Collect these logs from Heroku/Rollbar over a representative time window (suggest: 7–14 days).

### Phase B — Restriction (after data collection)
Once the origin list is known, configure `cors()` with an explicit allowlist. Webhook callers (chatbots, messengers) typically send no `Origin` header at all — `cors()` skips the `Access-Control-Allow-Origin` response header for requests without `Origin`, so they are unaffected by CORS restriction.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/config/cors.js` | modify | Add origin logging in Phase A; add allowlist in Phase B |

### Do NOT Modify

- `src/config/http.js` — owned by task-05
- Any route files

## Implementation Steps

### Phase A: Add origin logging

```js
import cors from 'cors'

const seenOrigins = new Set()

function enableCors(app) {
  app.use((req, _res, next) => {
    const origin = req.headers['origin']
    if (origin && !seenOrigins.has(origin)) {
      seenOrigins.add(origin)
      console.info(`[CORS] New origin observed: ${origin}`)
    }
    next()
  })

  app.use(cors())
}

export { enableCors }
```

Deploy this to production. Monitor Heroku logs (`heroku logs --tail`) or Rollbar for `[CORS] New origin observed:` entries over 7–14 days.

### Phase B: Configure allowlist

Once origins are collected, create a `ALLOWED_ORIGINS` environment variable in Heroku config (comma-separated):

```
heroku config:set ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
```

Update `src/config/cors.js`:

```js
import cors from 'cors'

function enableCors(app) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : null

  const corsOptions = allowedOrigins
    ? {
        origin: (origin, callback) => {
          // Requests with no Origin header (webhooks, server-to-server) are always allowed
          if (!origin) return callback(null, true)
          if (allowedOrigins.includes(origin)) return callback(null, true)
          callback(new Error(`Origin ${origin} not allowed by CORS policy`))
        },
        credentials: true,
      }
    : {}

  app.use(cors(corsOptions))
}

export { enableCors }
```

Remove the logging middleware once restriction is in place.

## Testing

**Phase A:**
- [ ] Deploy to production and confirm `[CORS] New origin observed:` log lines appear
- [ ] After observation window, collect the full origin list from logs

**Phase B:**
- [ ] `npx jest` — all existing tests pass
- [ ] Set `ALLOWED_ORIGINS` to a test value; confirm a request from an unlisted browser origin is rejected
- [ ] Confirm a webhook POST (no `Origin` header) still succeeds
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] After Phase B is deployed, document the `ALLOWED_ORIGINS` env var in any `.env.example` or Heroku config documentation
- [ ] Run `document-solution` — the two-phase observability approach is a non-obvious pattern worth capturing in KB

## Completion Criteria

- [ ] Phase A: origin logging deployed to production
- [ ] Observation window completed; origin list collected
- [ ] Phase B: `ALLOWED_ORIGINS` configured in Heroku; `cors.js` updated with allowlist
- [ ] Webhook endpoints (no `Origin` header) unaffected
- [ ] All tests pass
- [ ] Changes committed to `plan/security-hardening/phase-2/task-09-cors-observability`
- [ ] `status.md` updated to `complete`
