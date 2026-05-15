# Research: httpOnly Cookie Auth for Express 5 + Bull Board — 2026

**Date**: 2026-05-14
**Purpose**: Pre-implementation research for security-hardening/phase-2/task-03-bull-board-auth

---

## Versions

| Package | Latest Version |
|---|---|
| `cookie-parser` | **1.4.7** |

No peer dependencies — compatible with Express 5.2.1. The `(req, res, next)` middleware signature is unchanged.

---

## Recommended `res.cookie()` Options

| Option | Value | Rationale |
|---|---|---|
| `httpOnly` | `true` | Blocks JS `document.cookie` access — primary XSS defence |
| `secure` | `process.env.NODE_ENV === 'production'` | HTTPS-only in prod; HTTP allowed in local dev |
| `sameSite` | `'strict'` | Maximum CSRF protection; no UX penalty for same-origin admin UI |
| `maxAge` | Match JWT `exp` in milliseconds | Avoid divergence causing premature `401` |
| `path` | `'/queue'` | Scope cookie to Bull Board only; never sent to `/api` or `/resources` |
| `signed` | omit (false) | JWT is self-verifying; signing the cookie adds no value |

**CRITICAL for Heroku**: `app.set('trust proxy', 1)` must be set in `http.js`. Without this, Heroku's internal HTTP means `req.secure = false` and the browser never sends a `secure` cookie. This flag is missing from the current `http.js`.

---

## SameSite: Strict vs Lax

**Use `strict`** for a same-origin admin UI:
- `Strict`: cookie never sent on cross-site requests — attacker can't link someone to `/queue` with auth
- `Lax`: cookie sent on cross-site top-level navigations (clicked links) — worse for admin tools
- OWASP recommendation: `Strict` is preferred for session cookies

---

## CSRF Protection

**Not required for this setup:**
- API routes (`/resources`, `/api`) use `x-access-token` header — browsers can't set custom headers cross-site (CORS preflight blocks it)
- Bull Board route uses `SameSite=Strict` cookie — never sent on cross-site requests
- Bull Board is read-only — no state-changing operations to protect

If Bull Board ever gains write operations, add CSRF token as defence-in-depth.

---

## Cookie JWT Middleware

```js
// src/app/middleware/authenticateCookie.js
import jwt from 'jsonwebtoken'

const SECRET = process.env.SECRET

export function authenticateCookie(req, res, next) {
  const token = req.cookies?.access_token
  if (!token) {
    return res.status(401).send('Unauthorized')
  }

  jwt.verify(token, SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send('Unauthorized')
    }
    req.userId = decoded.id
    next()
  })
}
```

Returns plain text `401` (not JSON) — Bull Board renders HTML in the browser, not a JSON consumer.
Returns `401` on verify failure, NOT `500`. This is the correct behavior.

---

## Wiring

### Step 1: Install

```bash
npm show cookie-parser version  # confirms 1.4.7
yarn add cookie-parser@1.4.7
```

### Step 2: Register in `src/config/http.js`

```js
import cookieParser from 'cookie-parser'

const app = express()
app.set('trust proxy', 1)  // Required for Heroku — must come before helmet/cors

app.use(helmet(helmetConfig()))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: false }))
app.use(cookieParser())  // after body parsers
// ... rest unchanged
```

### Step 3: Set cookie in `LoginController.js`

```js
async login(req, res) {
  try {
    const token = await this.authenticateUser.execute(req.body)

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days — matches JWT TOKEN_EXPIRATION='7d'
      path: '/queue',
    })

    return res.status(200).json({ token })
  } catch (err) {
    // ... existing error handling unchanged
  }
}
```

Note: JWT `TOKEN_EXPIRATION = '7d'` (from `AuthenticateUser.js`) → `maxAge = 7 * 24 * 60 * 60 * 1000` ms.

### Step 4: Guard Bull Board route in `src/config/routes.js`

```js
import { authenticateCookie } from '../app/middleware/authenticateCookie.js'

function routes(app) {
  app.use('/resources', resourcesRoutes)
  app.use('/api', apiRoutes)
  app.use('/login', loginRoutes)
  app.use('/queue', authenticateCookie, bullboardRoute)  // guarded
  app.get(/.*/, (req, res) => {
    res.sendFile(frontendIndexFile)
  })
}
```

---

## Dual Auth Security Implications

- **API routes unaffected**: `path: '/queue'` means browser only sends the cookie to `/queue` paths
- **XSS bounded**: `httpOnly` prevents JS from reading the cookie; Bull Board is read-only
- **Token lifetime**: cookie `maxAge` must match JWT `exp` — both are 7 days here
- **Logout**: Add a logout endpoint to clear the cookie:
  ```js
  res.clearCookie('access_token', { path: '/queue' })
  res.status(200).json({ message: 'Logged out' })
  ```
  The `path` must match the one used when setting; otherwise `clearCookie` silently fails.

---

## Express 5 Notes

- `res.cookie()` `sameSite` values: lowercase strings (`'strict'`, `'lax'`, `'none'`) or `true` for strict
- `app.use('/queue', ...)` strips the `/queue` prefix before passing to next handler — unchanged from Express 4
- cookie-parser reads raw `req.headers.cookie` only — unaffected by any Express 5 changes

---

## Key Files

- `src/config/http.js` — add `trust proxy`, `cookieParser()`
- `src/app/controllers/LoginController.js` — add `res.cookie()` call on successful login
- `src/config/routes.js` — add `authenticateCookie` middleware before Bull Board mount
- `src/app/middleware/authenticateCookie.js` — new file
- `src/app/usecases/auth/AuthenticateUser.js:TOKEN_EXPIRATION = '7d'` — reference for maxAge
