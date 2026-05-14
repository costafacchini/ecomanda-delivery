# Task: Bull Board Authentication

**Plan**: Security Hardening
**Phase**: 1
**Task ID (phase-local)**: task-03
**Task Path**: phase-1/task-03-bull-board-auth
**Depends On**: phase-1/task-01-helmet-cors
**JIRA**: N/A

## Objective

Protect the `/queue` Bull Board UI behind JWT authentication using a `httpOnly` cookie, so a logged-in SPA user can navigate to `/queue` directly in the browser without any extra steps.

## Context

The SPA stores the JWT in `localStorage` (`@ecomanda-delivery-bearer`) and sends it as the `x-access-token` header on API calls. However, when the browser navigates to `/queue`, it performs a full page load — no JavaScript runs, so `localStorage` can't be read and custom headers can't be set. The only mechanism that works for browser navigation is a cookie.

**Approach**: On successful login, `LoginController` also sets a `httpOnly` cookie alongside the existing JSON response. The `/queue` auth middleware reads the token from this cookie.

The existing `/resources` API routes are unaffected — they continue to use `x-access-token`.

**Dependencies**: This task adds `cookie-parser` to `src/config/http.js`, which is owned by `task-01-helmet-cors`. Branch from that task's merged output.

**JWT expiry**: `7d` (defined in `AuthenticateUser.js:TOKEN_EXPIRATION`). Cookie `maxAge` must match.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Confirm `phase-1/task-01-helmet-cors` status is `complete`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Look up current `cookie-parser` version: `npm show cookie-parser version`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/config/http.js` | modify | Register `cookie-parser` middleware (after Helmet from task-01) |
| `src/app/controllers/LoginController.js` | modify | Set `httpOnly` cookie on successful login |
| `src/config/routes.js` | modify | Add JWT cookie auth guard before `/queue` |
| `package.json` | modify | Add `cookie-parser` |
| `yarn.lock` | modify | Updated by yarn |

### Do NOT Modify

- `src/config/cors.js` — complete after task-01
- `src/app/routes/login-route.js` — owned by task-02
- `src/app/routes/resources-routes.js` — owned by task-07
- `src/app/routes/bull-board-route.js` — no changes needed here

## Implementation Steps

### Step 1: Install cookie-parser

```bash
npm show cookie-parser version   # get latest
yarn add cookie-parser@<version>
```

### Step 2: Register cookie-parser in src/config/http.js

Add after the existing Helmet middleware (added by task-01):

```js
import cookieParser from 'cookie-parser'
// ...
app.use(helmet())
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
```

### Step 3: Set cookie in LoginController on successful login

`LoginController.js` currently returns `res.status(200).json({ token })`. Also set the cookie in the same response:

```js
async login(req, res) {
  try {
    const token = await this.authenticateUser.execute(req.body)

    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: SEVEN_DAYS_MS,
    })

    return res.status(200).json({ token })
  } catch (err) {
    // ... existing error handling unchanged
  }
}
```

The existing JSON response (`{ token }`) is preserved — the SPA still stores the token in `localStorage` and uses the `x-access-token` header for API calls. The cookie is additive.

### Step 4: Add cookie auth guard in src/config/routes.js

```js
import jwt from 'jsonwebtoken'
import { router as loginRoutes } from '../app/routes/login-route.js'
import resourcesRoutes from '../app/routes/resources-routes.js'
import apiRoutes from '../app/routes/api-routes.js'
import bullboardRoute from '../app/routes/bull-board-route.js'
import { frontendIndexFile } from './frontend-paths.js'

const SECRET = process.env.SECRET

function requireCookieAuth(req, res, next) {
  const token = req.cookies?.access_token
  if (!token) return res.status(401).send('Não autorizado.')

  jwt.verify(token, SECRET, (err) => {
    if (err) return res.status(401).send('Token inválido.')
    next()
  })
}

function routes(app) {
  app.use('/resources', resourcesRoutes)
  app.use('/api', apiRoutes)
  app.use('/login', loginRoutes)
  app.use('/queue', requireCookieAuth, bullboardRoute)
  app.get(/.*/, (req, res) => {
    res.sendFile(frontendIndexFile)
  })
}

export { routes }
```

Note: `res.status(401).send(...)` (not JSON) — the browser shows the text directly since Bull Board renders its own HTML.

## Testing

- [ ] `npx jest` — all existing tests pass, including `LoginController` tests
- [ ] Manual — not logged in: navigate to `/queue` → 401 response
- [ ] Manual — log in via the SPA, then navigate to `/queue` in the same browser → Bull Board UI renders
- [ ] Manual — log in, clear cookies, navigate to `/queue` → 401
- [ ] Check cookie in browser DevTools: `httpOnly: true`, `SameSite: Strict`, `Secure` in production
- [ ] Confirm SPA API calls (`/resources/*`) still work — they use `x-access-token`, not the cookie
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc required

## Completion Criteria

- [ ] `/queue` returns 401 without valid cookie
- [ ] Logging in via the SPA sets the `access_token` cookie
- [ ] `/queue` renders Bull Board UI for a logged-in browser session
- [ ] Cookie is `httpOnly`, `Secure` (production), `SameSite=Strict`, `maxAge=7d`
- [ ] Existing SPA and API behaviour unchanged
- [ ] All tests pass
- [ ] Changes committed to `plan/security-hardening/phase-1/task-03-bull-board-auth`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- This task modifies `src/config/http.js` (cookie-parser) — it must branch from the merged output of `task-01-helmet-cors`, which owns that file.
- `task-07` owns `src/app/routes/resources-routes.js` — the `authenticate` function there is untouched by this task.
