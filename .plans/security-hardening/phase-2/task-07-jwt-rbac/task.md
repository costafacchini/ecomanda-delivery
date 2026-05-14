# Task: JWT 500→401 Fix + RBAC on Resources Routes

**Plan**: Security Hardening
**Phase**: 2
**Task ID (phase-local)**: task-07
**Task Path**: phase-2/task-07-jwt-rbac
**Depends On**: None
**JIRA**: N/A

## Objective

Fix the JWT verification failure returning HTTP 500 instead of 401, and add role-based authorization (super-user only) to the `/resources/users` and `/resources/licensees` write endpoints.

## Context

`src/app/routes/resources-routes.js`:

**JWT fix** — line 112:
```js
if (err) return res.status(500).json({ auth: false, message: 'Falha na autenticação com token.' })
```
A failed JWT verification is a client error (bad/expired token), not a server error. Should return 401.

**RBAC gap** — lines 121-129: `POST /users`, `POST /users/:id`, `POST /licensees`, `POST /licensees/:id` have no role check. Only `/dashboard/*` checks `isSuper` (lines 158–165). Creating or updating users and licensees should be restricted to super users.

The `decoded` JWT payload (assigned to `req.userId = decoded.id`) may carry role information — check the `User` model and `AuthenticateUser` use case to confirm what fields the token encodes. If the token only encodes `id`, fetch the user from the database in a second middleware (`requireSuper`) using `req.userId`.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Read `src/app/usecases/auth/AuthenticateUser.js` to confirm what the JWT payload contains
- [ ] Read `src/app/models/User.js` to understand the `isSuper` field
- [ ] Search for existing RBAC patterns: `grep -n "isSuper" src/app/routes/resources-routes.js`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/routes/resources-routes.js` | modify | Fix 500→401; add `requireSuper` middleware to users/licensees writes |

### Do NOT Modify

- `src/config/http.js` — owned by task-05
- `src/app/routes/api-routes.js` — owned by task-06
- `src/app/routes/v1/v1-routes.js` — owned by task-08
- `src/config/routes.js` — complete after task-03

## Implementation Steps

### Step 1: Fix JWT verification error code

In `src/app/routes/resources-routes.js`, line 112:

```js
// Before
if (err) return res.status(500).json({ auth: false, message: 'Falha na autenticação com token.' })

// After
if (err) return res.status(401).json({ auth: false, message: 'Falha na autenticação com token.' })
```

### Step 2: Check what the JWT payload contains

Read `src/app/usecases/auth/AuthenticateUser.js`. If the token only contains `{ id }`, the `requireSuper` middleware must look up the user:

```js
async function requireSuper(req, res, next) {
  const user = await userRepository.findFirst({ _id: req.userId })
  if (!user || !user.isSuper) {
    return res.status(403).json({ message: 'Acesso negado.' })
  }
  next()
}
```

If the token already contains `isSuper`, decode from `req.user` (set in `authenticate`) instead.

### Step 3: Apply requireSuper to write endpoints

```js
router.post('/users', requireSuper, usersController.validations(), usersController.create)
router.post('/users/:id', requireSuper, usersController.validations(), usersController.update)
router.post('/licensees', requireSuper, licenseesController.validations(), licenseesController.create)
router.post('/licensees/:id', requireSuper, licenseesController.validations(), licenseesController.update)
```

Read-only endpoints (`GET /users`, `GET /licensees`, `GET /users/:id`, `GET /licensees/:id`) remain accessible to all authenticated users.

## Testing

- [ ] `npx jest` — all existing tests pass
- [ ] Write or update tests:
  - JWT verify failure → 401 (not 500)
  - Non-super user POSTing to `/resources/users` → 403
  - Super user POSTing to `/resources/users` → proceeds normally
  - Non-super user GETting `/resources/users` → 200 (read access unchanged)
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc required

## Completion Criteria

- [ ] JWT verification failure returns 401
- [ ] `POST /resources/users` and `POST /resources/licensees` (create + update) require `isSuper`
- [ ] GET endpoints unaffected
- [ ] All tests pass
- [ ] Changes committed to `plan/security-hardening/phase-2/task-07-jwt-rbac`
- [ ] `status.md` updated to `complete`
