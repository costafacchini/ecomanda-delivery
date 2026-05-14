# Research: Rate Limiting with express-rate-limit — 2026

**Date**: 2026-05-14
**Purpose**: Pre-implementation research for security-hardening/phase-1/task-02-rate-limiting

---

## IMPORTANT: Version Update

The task plan references express-rate-limit v7. **Current latest is v8.5.2.** Use v8 — v7 API patterns are deprecated.

| Package | Latest Version | Notes |
|---|---|---|
| `express-rate-limit` | **8.5.2** | `max` → `limit`, `standardHeaders: true` → `standardHeaders: 'draft-7'` |
| `rate-limit-redis` | **5.0.0** | Requires `express-rate-limit >= 8.5.0` |

---

## Express 5 Compatibility

express-rate-limit v8 declares `peerDependencies: { express: ">= 4.11" }`. Express 5.2.1 satisfies this. The package's own test suite runs against Express 5.2.1. No breaking changes.

---

## v7 → v8 Breaking Changes

| v7 Pattern | v8 Replacement |
|---|---|
| `max: 10` | `limit: 10` (`max` still works but soft-deprecated) |
| `standardHeaders: true` | `standardHeaders: 'draft-7'` (boolean triggers deprecation warning) |
| `req.rateLimit.current` | `req.rateLimit.used` |
| `onLimitReached` option | removed — use `handler` function |
| `setting limit: 0` | blocks ALL requests (not a disable) |
| IPv6 | Now masked to /56 subnet by default |

---

## Recommended Configuration for Login Endpoint

```js
import { rateLimit } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { redisConnection } from '../../config/redis.js'

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,       // 15-minute window
  limit: 10,                        // max 10 attempts per window
  standardHeaders: 'draft-7',       // RateLimit + RateLimit-Policy headers
  legacyHeaders: false,             // suppress X-RateLimit-* headers
  message: { message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  store: new RedisStore({
    sendCommand: (command, ...args) => redisConnection.call(command, ...args),
    prefix: 'rl:login:',           // avoid collision with BullMQ keys
  }),
  // passOnStoreError: false (default) — fail closed if Redis is down
})
```

### `standardHeaders: 'draft-7'` emits

- `RateLimit: limit=10, remaining=9, reset=900`
- `RateLimit-Policy: 10;w=900`
- `Retry-After: <seconds>` on 429 responses

---

## Redis Store (Strongly Recommended)

**Why**: App runs on Heroku with multiple dynos. MemoryStore is per-process — each dyno has its own counter, so users can bypass the limit by hitting different dynos. Redis is required for distributed rate limiting.

**Existing Redis**: `src/config/redis.js` exports a singleton `redisConnection` (ioredis). Handles TLS for Heroku Redis (`rediss://`) with `maxRetriesPerRequest: null` and `enableReadyCheck: false`. **Reuse this connection** — do not create a new one.

**New dependency needed**: `rate-limit-redis@5.0.0` (not just `express-rate-limit`).

```js
// ioredis sendCommand wiring (different from node-redis!)
sendCommand: (command, ...args) => redisConnection.call(command, ...args)
```

---

## Trust Proxy (Critical for Heroku)

**Must verify** `app.set('trust proxy', 1)` is set in `src/config/http.js` before the rate limiter runs. Without this on Heroku, `req.ip` returns the Heroku router address (`10.x.x.x`) — all users share a single rate limit bucket. See `docs/kb/architecture/express-conventions.md:28`.

This is task-01's responsibility (http.js ownership). Confirm it's set when implementing.

---

## Complete Implementation

### `src/app/routes/login-route.js`

```js
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import jwt from 'jsonwebtoken'
import { LoginController } from '../controllers/LoginController.js'
import { UserRepositoryDatabase } from '../repositories/user.js'
import { AuthenticateUser } from '../usecases/auth/AuthenticateUser.js'
import { redisConnection } from '../../config/redis.js'

const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  store: new RedisStore({
    sendCommand: (command, ...args) => redisConnection.call(command, ...args),
    prefix: 'rl:login:',
  }),
})

const SECRET = process.env.SECRET
const userRepository = new UserRepositoryDatabase()
const tokenService = { sign: jwt.sign, secret: SECRET }
const authenticateUser = new AuthenticateUser({ userRepository, tokenService })
const loginController = new LoginController({ authenticateUser })

router.post('/', loginLimiter, loginController.login)

export { router }
```

### `package.json` additions

```json
"express-rate-limit": "8.5.2",
"rate-limit-redis": "5.0.0"
```

---

## Dependencies to Install

```bash
npm show express-rate-limit version  # verify 8.5.2
npm show rate-limit-redis version    # verify 5.0.0
yarn add express-rate-limit@8.5.2 rate-limit-redis@5.0.0
```
