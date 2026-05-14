# Task: Error Response Hardening

**Plan**: Security Hardening
**Phase**: 2
**Task ID (phase-local)**: task-05
**Task Path**: phase-2/task-05-error-response-hardening
**Depends On**: phase-1/task-01-helmet-cors
**JIRA**: N/A

## Objective

Fix the error handler in `src/config/http.js` to stop leaking stack traces and raw error objects in API responses, and ensure that controllers returning `err.toString()` in responses are sanitized.

## Context

`src/config/http.js` line 47 has: `res.status(err.status || 500).send(err)` — this sends the full error object (including stack trace) to the client.

Several controllers call `err.toString()` in error responses (e.g., `UsersController.js:68` mentions `'Cast to ObjectId failed'`, exposing MongoDB internals). These should return generic 500/422 messages; details belong in server-side logs only.

This task depends on `task-01-helmet-cors` because both modify `src/config/http.js`. Branch from the merged output of task-01.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Confirm `phase-1/task-01-helmet-cors` status is `complete`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/config/http.js` | modify | Fix error handler — no stack traces in response |
| `src/app/controllers/UsersController.js` | modify | Remove `err.toString()` from error response |
| `src/app/controllers/CartsController.js` | modify | Same — remove `err.toString()` |
| `src/app/controllers/LoginController.js` | modify | Same — remove `${err}` in error message |

### Do NOT Modify

- `src/config/cors.js` — complete after task-01
- `src/app/routes/resources-routes.js` — owned by task-07
- `src/app/routes/api-routes.js` — owned by task-06

## Implementation Steps

### Step 1: Fix the error handler in src/config/http.js

Replace the non-Rollbar error handler (lines 40–48):

```js
app.use(function (err, req, res, _next) {
  const status = err.status || 500
  // Log full error server-side, never expose to client
  console.error(err)
  res.status(status).json({ message: status < 500 ? err.message : 'Erro interno do servidor.' })
})
```

The `_next` parameter is required for Express to recognise this as an error handler (4-argument signature).

### Step 2: Audit controllers for err.toString() / ${err} in responses

Search: `grep -rn "err\.toString\|\\${err}" src/app/controllers/`

For each occurrence, replace with a generic message:

```js
// Before
res.status(500).json({ message: err.toString() })

// After
console.error(err)
res.status(500).json({ message: 'Erro interno do servidor.' })
```

If the code checks `err.toString().includes('Cast to ObjectId failed')` to detect a 404-style condition, convert it to a proper `instanceof` or status code check instead:

```js
// Before
if (err.toString().includes('Cast to ObjectId failed')) {
  return res.status(404).json({ message: 'Não encontrado.' })
}

// After
if (err.name === 'CastError' && err.kind === 'ObjectId') {
  return res.status(404).json({ message: 'Não encontrado.' })
}
```

## Testing

- [ ] `npx jest` — all existing tests pass
- [ ] Trigger a 500 error (e.g., invalid ObjectId in a request) and confirm the response body does not contain a stack trace
- [ ] Confirm server-side `console.error` still fires (for observability)
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc required — error handling convention is self-evident in code

## Completion Criteria

- [ ] Error handler never returns raw error object or stack trace to client
- [ ] `err.toString()` / `${err}` removed from all controller responses
- [ ] CastError detection uses `err.name`/`err.kind` not string matching
- [ ] All tests pass
- [ ] Changes committed to `plan/security-hardening/phase-2/task-05-error-response-hardening`
- [ ] `status.md` updated to `complete`
