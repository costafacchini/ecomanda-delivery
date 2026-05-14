# Task: Bull Board Authentication

**Plan**: Security Hardening
**Phase**: 1
**Task ID (phase-local)**: task-03
**Task Path**: phase-1/task-03-bull-board-auth
**Depends On**: None
**JIRA**: N/A

## Objective

Protect the `/queue` Bull Board UI behind JWT authentication so only authenticated users can view or manage job queues.

## Context

`src/app/routes/bull-board-route.js` creates the Bull Board Express adapter and exports its router. It has no authentication.

`src/config/routes.js` mounts it as `app.use('/queue', bullboardRoute)`.

`src/app/routes/resources-routes.js` already has an `authenticate` function that verifies the `x-access-token` JWT header. We should extract or duplicate that middleware rather than coupling route files.

The cleanest approach: create a small `src/app/middlewares/authenticate.js` module that exports the JWT middleware, then use it in `resources-routes.js` and in the Bull Board route registration.

Alternatively (simpler, less invasive): apply the existing authenticate logic inline in `src/config/routes.js` before mounting the Bull Board router.

Prefer the inline approach in `routes.js` to minimise file changes. If a `middlewares/` directory already exists, use it instead.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Check if `src/app/middlewares/` exists: `ls src/app/middlewares/` — if it does, follow existing patterns
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/config/routes.js` | modify | Add JWT auth middleware before `/queue` mount |
| `src/app/routes/bull-board-route.js` | modify (optional) | Only if a self-contained approach is cleaner |

### Do NOT Modify

- `src/config/http.js` — owned by task-01
- `src/config/cors.js` — owned by task-01
- `src/app/routes/login-route.js` — owned by task-02
- `src/app/routes/resources-routes.js` — owned by task-07
- `src/app/controllers/ChatbotsController.js` — owned by task-04

## Implementation Steps

### Step 1: Add auth guard in src/config/routes.js

```js
import jwt from 'jsonwebtoken'
import { router as loginRoutes } from '../app/routes/login-route.js'
import resourcesRoutes from '../app/routes/resources-routes.js'
import apiRoutes from '../app/routes/api-routes.js'
import bullboardRoute from '../app/routes/bull-board-route.js'
import { frontendIndexFile } from './frontend-paths.js'

const SECRET = process.env.SECRET

function requireAuth(req, res, next) {
  const token = req.headers['x-access-token']
  if (!token) return res.status(401).json({ auth: false, message: 'Token não informado.' })

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ auth: false, message: 'Token inválido.' })
    req.userId = decoded.id
    next()
  })
}

function routes(app) {
  app.use('/resources', resourcesRoutes)
  app.use('/api', apiRoutes)
  app.use('/login', loginRoutes)
  app.use('/queue', requireAuth, bullboardRoute)
  app.get(/.*/, (req, res) => {
    res.sendFile(frontendIndexFile)
  })
}

export { routes }
```

### Step 2: Verify Bull Board still works

Access `/queue` without a token — expect 401. Access with a valid `x-access-token` header — expect the Bull Board UI to render.

## Testing

- [ ] `npx jest` — all existing tests pass
- [ ] Manual: GET `/queue` without token → 401
- [ ] Manual: GET `/queue` with valid `x-access-token` → Bull Board UI renders
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc required — standard JWT middleware application

## Completion Criteria

- [ ] `/queue` returns 401 without a valid token
- [ ] `/queue` renders Bull Board UI with a valid token
- [ ] All tests pass
- [ ] Changes committed to `plan/security-hardening/phase-1/task-03-bull-board-auth`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- task-07 owns `src/app/routes/resources-routes.js`. The `authenticate` function there is intentionally NOT refactored into a shared module in this task — that can be a follow-up. Duplicating the logic in `routes.js` is deliberate to keep this task self-contained.
