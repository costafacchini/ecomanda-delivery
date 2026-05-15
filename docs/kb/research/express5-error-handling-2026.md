# Research: Express 5 Error Handling — 2026

**Date**: 2026-05-14
**Purpose**: Pre-implementation research for security-hardening/phase-2/task-05-error-response-hardening

---

## Summary

### Key Breaking Change: 4-argument error handler is REQUIRED

Express 5 detects error-handling middleware by arity — **exactly 4 parameters** `(err, req, res, next)`. If the fourth parameter is omitted, Express silently ignores it as an error handler. This means the existing handler in `src/config/http.js:40` (3 args) is **never called as an error handler** and raw errors reach the default Express fallback.

### Async errors auto-propagate in Express 5

Express 5 automatically forwards any rejected promise or thrown error from async handlers to the next error middleware. No `try/catch` + `next(err)` wrapper is needed for generic 500 handling. Controllers can drop their catch blocks entirely for the generic error case.

### The 4-arg signature itself is UNCHANGED

`(err, req, res, next)` — same as Express 4. Only the strictness around the 4-argument requirement changed.

---

## Current State in Codebase (Problems Found)

| Location | Problem |
|---|---|
| `src/config/http.js:40` | Error handler has 3 args — Express 5 never calls it. Line 47 sends raw `err` (stack traces). |
| `src/app/controllers/LoginController.js:26` | `res.status(500).json({ message: \`Erro ao tentar fazer login. ${err}\` })` — error stringified into response |
| `src/app/controllers/UsersController.js:36,56,68,71,80` | `err.toString()` in responses; CastError detected via string matching |
| `src/app/controllers/CartsController.js:53,75,97+` | Same `err.toString()` pattern, 9+ occurrences |
| `src/app/controllers/ContactsController.js:41,55,68` | Same |
| `src/app/controllers/LicenseesController.js:63,82,93,96,139,149+` | Same, many occurrences |
| `src/app/controllers/DashboardController.js:69,121,155+` | Same, 7+ occurrences |
| `src/app/controllers/MessagesController.js:62,97` | Same |
| `src/app/routes/resources-routes.js:112` | JWT verify failure returns 500 — should be 401 (task-07) |
| `src/app/helpers/SanitizeErrors.js` | Good: already used for 422 Mongoose ValidationError handling |

---

## Recommended Express 5 Error Handler

### `src/config/errorHandler.js` (new file)

```js
/**
 * Global error handler for Express 5.
 *
 * Registration order in src/config/http.js:
 *   1. routes(app)
 *   2. app.use(notFoundHandler)  ← 404 catch-all
 *   3. app.use(errorHandler)     ← must be last, 4 args
 *
 * The 4-argument signature is REQUIRED — Express detects error handlers
 * by arity. Removing _next would silently break this middleware.
 */

export function notFoundHandler(req, res, next) {
  res.status(404).json({ errors: [{ message: 'Recurso não encontrado.' }] })
}

export function errorHandler(err, req, res, _next) {
  // If headers already sent (streaming), delegate to Express built-in
  if (res.headersSent) {
    return _next(err)
  }

  // Mongoose CastError: invalid ObjectId in URL param → 404
  // Use err.name === 'CastError', NOT err.toString().includes('Cast to ObjectId failed')
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(404).json({ errors: [{ message: 'Recurso não encontrado.' }] })
  }

  // Mongoose ValidationError: save/update with invalid fields → 422
  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map((e) => ({ message: e.message }))
    return res.status(422).json({ errors: messages })
  }

  // jsonwebtoken errors → 401
  // JsonWebTokenError: malformed/invalid signature
  // TokenExpiredError: expired (subclass of JsonWebTokenError)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ errors: [{ message: 'Não autorizado.' }] })
  }

  // Custom domain errors with statusCode < 500 (e.g. AuthenticateUserValidationError)
  if (err.statusCode && err.statusCode < 500) {
    return res.status(err.statusCode).json({ errors: [{ message: err.message }] })
  }

  // Generic 500 — log full error server-side, NEVER send internals to client
  console.error('[errorHandler]', err)
  res.status(500).json({ errors: [{ message: 'Erro interno do servidor.' }] })
}
```

### Registration in `src/config/http.js`

```js
import { notFoundHandler, errorHandler } from './errorHandler.js'

// ... existing middleware, routes ...
routes(app)

app.use(notFoundHandler)  // after routes
app.use(errorHandler)     // last — 4 args required
```

---

## Controller Migration Pattern

Once the global handler exists, remove `err.toString()` from response bodies:

```js
// BEFORE — leaks internals
async show(req, res) {
  try {
    const user = await this.userRepository.findById(req.params.id)
    res.status(200).send(user)
  } catch (err) {
    if (err.toString().includes('Cast to ObjectId failed')) {
      return res.status(404).send({ errors: { message: 'Não encontrado' } })
    }
    return res.status(500).send({ errors: { message: err.toString() } })
  }
}

// AFTER — Express 5 auto-propagates; errorHandler catches CastError → 404, others → 500
async show(req, res) {
  const user = await this.userRepository.findById(req.params.id)
  res.status(200).send(user)
}
```

**Keep** existing 422 handlers that use `sanitizeModelErrors` — they are already sanitized (no stack trace).

---

## Logging: Server vs Client

| Error Type | Server Log | Client Response |
|---|---|---|
| 5xx unexpected | Full `err` + `.stack` | `"Erro interno do servidor."` |
| CastError (4xx) | Not needed | `"Recurso não encontrado."` |
| ValidationError (4xx) | Not needed | field-level messages |
| JWT error (4xx) | Optional info | `"Não autorizado."` |
| Custom domain error | Not needed | `err.message` (safe, crafted by app) |

---

## Scope Note

`src/app/routes/resources-routes.js:112` — JWT `verify` callback returning 500 is fixed in **task-07-jwt-rbac**, not here. The `verify` callback form bypasses async propagation, so it needs an explicit fix at the call site.

---

## Key Files

- `src/config/http.js` — existing broken error handler (lines 40–48)
- `src/app/helpers/SanitizeErrors.js` — existing `sanitizeModelErrors` helper (keep for 422 paths)
- `src/app/usecases/auth/AuthenticateUser.js` — `AuthenticateUserValidationError` custom error class pattern
