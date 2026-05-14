# Task: CORS Origin Observability → Restriction

**Plan**: Security Hardening
**Phase**: 2
**Task ID (phase-local)**: task-09
**Task Path**: phase-2/task-09-cors-observability
**Depends On**: None
**JIRA**: N/A

## Objective

Collect the set of origins currently sending requests to the API by storing them in Redis, then use that data to configure an explicit CORS allowlist.

## Context

`src/config/cors.js` calls `cors()` with no options (allows all origins). We want to restrict this — but we don't know which origins are active today. Webhook callers (chatbots, messengers) typically send no `Origin` header at all, so they won't be affected by CORS restriction regardless. Browser-based callers (the admin SPA, external apps) will.

**Console logging is not viable** — the application receives too many requests per day and log infrastructure is limited. Instead, store every observed `Origin` value in a Redis Set using `SADD`. Redis Sets automatically deduplicate, so repeated origins cost nothing after the first hit.

The Redis connection is already available via `src/config/redis.js` (`redisConnection`, ioredis instance).

**Key to use:** `cors:observed-origins` (a Redis Set)

This task has two phases:

### Phase A — Collect (deploy, leave running for 7–14 days)
Middleware intercepts `req.headers.origin` and calls `SADD cors:observed-origins <origin>` on each unique value. No blocking, no logging noise.

### Phase B — Restrict (after review)
Read the set (`SMEMBERS cors:observed-origins`), review the list with the team, set `ALLOWED_ORIGINS` in Heroku config, and update `cors.js` with the allowlist. Remove the SADD middleware.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Confirm Redis is available in the target environment: `heroku redis:info`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/config/cors.js` | modify | Phase A: add SADD middleware; Phase B: replace with allowlist |

### Do NOT Modify

- `src/config/http.js` — owned by task-05
- `src/config/redis.js` — read-only, use the exported `redisConnection`
- Any route files

## Implementation Steps

### Phase A: Collect origins in Redis

```js
import cors from 'cors'
import { redisConnection } from './redis.js'

function enableCors(app) {
  app.use((req, _res, next) => {
    const origin = req.headers['origin']
    if (origin) {
      redisConnection.sadd('cors:observed-origins', origin).catch(() => {})
    }
    next()
  })

  app.use(cors())
}

export { enableCors }
```

Notes:
- `.catch(() => {})` — silently swallows Redis errors so a Redis hiccup never takes down a request
- `sadd` is fire-and-forget (no `await`) — the middleware adds no latency to the request path

Deploy to production and leave running for 7–14 days. To inspect collected origins at any point:

```bash
heroku redis:cli
> SMEMBERS cors:observed-origins
```

Or via Node:
```bash
heroku run node -e "import('./src/config/redis.js').then(r => r.redisConnection.smembers('cors:observed-origins').then(console.log))"
```

### Phase B: Configure allowlist

After reviewing the origin list with the team:

1. Set the env var in Heroku:
```bash
heroku config:set ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
```

2. Replace `src/config/cors.js`:

```js
import cors from 'cors'

function enableCors(app) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : null

  const corsOptions = allowedOrigins
    ? {
        origin: (origin, callback) => {
          // No Origin header = webhook / server-to-server — always allow
          if (!origin) return callback(null, true)
          if (allowedOrigins.includes(origin)) return callback(null, true)
          callback(new Error(`CORS: origin ${origin} not in allowlist`))
        },
        credentials: true,
      }
    : {}

  app.use(cors(corsOptions))
}

export { enableCors }
```

3. Remove the `SADD` middleware and the `redisConnection` import from `cors.js`.

## Testing

**Phase A:**
- [ ] Deploy to staging/production
- [ ] Trigger a browser request (or use `curl -H "Origin: https://test.example.com"`) and confirm the origin appears in the Redis set: `SMEMBERS cors:observed-origins`
- [ ] Confirm a request with no `Origin` header is unaffected

**Phase B:**
- [ ] `npx jest` — all existing tests pass
- [ ] Set `ALLOWED_ORIGINS` to a test value; confirm a request from an unlisted browser origin receives a CORS error
- [ ] Confirm a webhook POST (no `Origin` header) still returns 200
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] After Phase B is complete, document `ALLOWED_ORIGINS` in `.env.example` or Heroku config docs
- [ ] Run `document-solution` — two-phase Redis observability pattern is worth capturing in KB

## Completion Criteria

- [ ] Phase A: origin-collection middleware deployed; Redis set populating
- [ ] Observation window completed; origin list reviewed with team
- [ ] Phase B: `ALLOWED_ORIGINS` set in Heroku; `cors.js` updated with allowlist; SADD middleware removed
- [ ] Webhook endpoints (no `Origin` header) unaffected
- [ ] All tests pass
- [ ] Changes committed to `plan/security-hardening/phase-2/task-09-cors-observability`
- [ ] `status.md` updated to `complete`
