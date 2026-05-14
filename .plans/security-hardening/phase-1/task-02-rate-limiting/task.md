# Task: Rate Limiting on Login

**Plan**: Security Hardening
**Phase**: 1
**Task ID (phase-local)**: task-02
**Task Path**: phase-1/task-02-rate-limiting
**Depends On**: None
**JIRA**: N/A

## Objective

Add rate limiting to the `/login` endpoint to prevent brute-force attacks.

## Context

`src/app/routes/login-route.js` mounts a single `POST /` handler via `LoginController`. There is no rate limiting in the project today — `express-rate-limit` is not in `package.json`.

The route is registered as `app.use('/login', loginRoutes)` in `src/config/routes.js`.

Rate limiting should be applied at the route level (not globally) to avoid interfering with other endpoints. A sensible default: 10 attempts per 15 minutes per IP.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Look up current express-rate-limit version: `npm show express-rate-limit version`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/routes/login-route.js` | modify | Apply rate limiter middleware |
| `package.json` | modify | Add express-rate-limit dependency |
| `yarn.lock` | modify | Updated by yarn |

### Do NOT Modify

- `src/config/http.js` — owned by task-01
- `src/config/cors.js` — owned by task-01
- `src/app/routes/bull-board-route.js` — owned by task-03
- `src/config/routes.js` — owned by task-03
- `src/app/controllers/ChatbotsController.js` — owned by task-04

## Implementation Steps

### Step 1: Install express-rate-limit

```bash
npm show express-rate-limit version   # get latest
yarn add express-rate-limit@<version>
```

### Step 2: Update src/app/routes/login-route.js

```js
import express from 'express'
import rateLimit from 'express-rate-limit'
import jwt from 'jsonwebtoken'
import { LoginController } from '../controllers/LoginController.js'
import { UserRepositoryDatabase } from '../repositories/user.js'
import { AuthenticateUser } from '../usecases/auth/AuthenticateUser.js'

const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
})

const SECRET = process.env.SECRET
const userRepository = new UserRepositoryDatabase()
const tokenService = { sign: jwt.sign, secret: SECRET }
const authenticateUser = new AuthenticateUser({ userRepository, tokenService })
const loginController = new LoginController({ authenticateUser })

router.post('/', loginLimiter, loginController.login)

export { router }
```

## Testing

- [ ] `npx jest` — all existing tests pass
- [ ] Start the dev server and manually POST to `/login` more than 10 times in quick succession — confirm 429 response with `Retry-After` header
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc required — standard express-rate-limit usage

## Completion Criteria

- [ ] Login endpoint returns 429 after 10 attempts within 15 minutes
- [ ] `Retry-After` header present on 429 responses (`standardHeaders: true`)
- [ ] All tests pass
- [ ] Changes committed to `plan/security-hardening/phase-1/task-02-rate-limiting`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

No parallel tasks in phase 1 touch `login-route.js`.
