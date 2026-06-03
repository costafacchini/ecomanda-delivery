# Task: Route authorization rollout

**Plan**: Local Chat Infrastructure
**Phase**: 3
**Task ID (phase-local)**: task-05
**Task Path**: phase-3/task-05-route-authorization
**Depends On**: phase-2/task-03-local-chat-plugin, phase-2/task-04-frontend-super-flow
**JIRA**: N/A

## Objective

Apply `authorize()` guards to all existing routes based on the required role, fix the server-side message access gap (non-super users querying other licensees' data), and update the remaining frontend `isAdmin`/`isSuper` references to use `currentUser.role`.

## Context

**Backend gaps found:**
1. `resources-routes.ts` currently only guards user/licensee creation with `requireSuper`. Contacts, messages, triggers, templates have no server-side authorization guard.
2. `MessagesController.index()` applies no server-side licensee filter — a non-super user can query any licensee's messages by passing `?licensee=<anyId>`.
3. `MessagesController.resend()` correctly checks licensee ownership — this is the pattern to follow for `index()`.

**Route authorization matrix (apply with `authorize()`):**

| Route group | Minimum role |
|-------------|--------------|
| `POST/PUT /users`, `POST/PUT /licensees` | `super` |
| `GET /users`, `GET /licensees`, `DELETE /licensees/:id` | `admin` or `super` |
| `POST/PUT/DELETE /contacts`, `POST/PUT/DELETE /triggers`, `POST/PUT/DELETE /templates` | `admin` or `super` |
| `GET /contacts`, `GET /messages`, `GET /triggers`, `GET /templates` | any authenticated (`agent` and above) |
| `POST /messages`, `/chat/rooms/*` | any authenticated |
| `GET /reports/*` | `admin` or `super` |

> Use judgment when reviewing routes — the matrix above is a guide. The executing agent should read each route and determine the appropriate role based on the resource sensitivity.

**Server-side licensee filter fix (`MessagesController.index()`):**

After `authorize()` populates `req.user`, add:
```js
if (!['super'].includes(req.user.role) && req.query.licensee !== req.user.licensee?.toString()) {
  req.query.licensee = req.user.licensee?.toString()
}
```

Apply the same pattern to `ContactsController.index()` and any other index controller that accepts a `licensee` query param without validation.

**Frontend cleanup:**
The remaining `isAdmin`/`isSuper` references after task-04 (which already updated Navbar). Other pages to check:
- `client/src/pages/Messages/scenes/Index/index.tsx` — `!currentUser.isSuper` filter check
- `client/src/pages/Reports/` — if admin/super check exists
- `client/src/pages/routes.tsx` — if route guards check roles

**`isAdmin` and `isSuper` removal:** After all references are migrated to `role`, remove `isAdmin` and `isSuper` from the `User` schema. This is the final cleanup.

Read `src/app/routes/resources-routes.ts` (full file) and `src/app/controllers/MessagesController.ts` before implementing.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/local-chat-infra/phase-3/task-05-route-authorization`
- [ ] Verify `phase-2/task-03-local-chat-plugin/status.md` shows `complete`
- [ ] Verify `phase-2/task-04-frontend-super-flow/status.md` shows `complete`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Read `src/app/routes/resources-routes.ts` (full file)
- [ ] Read `src/app/routes/v1/v1-routes.ts` (full file)
- [ ] Read `src/app/controllers/MessagesController.ts` (full file)
- [ ] Grep for `isAdmin` and `isSuper` across `client/src/` to find all remaining references
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/routes/resources-routes.ts` | modify | Apply `authorize()` to routes; server-side licensee filter fix |
| `src/app/controllers/MessagesController.ts` | modify | Enforce licensee filter for non-super |
| `src/app/controllers/ContactsController.ts` | modify | Enforce licensee filter for non-super |
| `src/app/models/User.ts` | modify | Remove deprecated `isAdmin` and `isSuper` fields |
| `src/app/models/User.spec.ts` | modify | Remove deprecated field tests |
| `client/src/pages/Messages/scenes/Index/index.tsx` | modify | `!currentUser.isSuper` → role check |
| Any other client page with `isAdmin`/`isSuper` checks | modify | Migrate to `currentUser.role` |

### Do NOT Modify

- `src/app/plugins/chats/` — complete (phase 2)
- `client/src/contexts/App/index.tsx` — complete (phase 2)
- `client/src/pages/Navbar/index.tsx` — complete (phase 2)

## Implementation Steps

### Step 1: Audit and apply `authorize()` to `resources-routes.ts`

Read every route. Apply `authorize()` based on the matrix in Context. Example:
```ts
// Before:
router.post('/users', requireSuper, usersController.create)

// After:
router.post('/users', authorize('super'), usersController.create)
router.get('/users', authorize('admin', 'super'), usersController.index)
```

Ensure `authorize()` is called AFTER `authenticate` (already guaranteed by `router.use(authenticate)` at line 132).

### Step 2: Fix server-side licensee filter in MessagesController and ContactsController

After `authorize()` runs and populates `req.user`, enforce the licensee constraint in index methods. Follow the existing pattern from `MessagesController.resend()`.

### Step 3: Remove `isAdmin` and `isSuper` from User schema

After verifying all backend references are migrated, remove the fields from `User.ts`. Run a grep first:
```bash
grep -rn "isAdmin\|isSuper" src/ --include="*.ts" | grep -v spec | grep -v node_modules
```
Only remove when all hits are confirmed migrated.

### Step 4: Migrate remaining frontend `isAdmin`/`isSuper` references

```bash
grep -rn "isAdmin\|isSuper" client/src/ --include="*.ts" --include="*.tsx"
```

For each hit, replace with the appropriate `currentUser.role` check:
- `currentUser.isAdmin` → `['admin', 'super'].includes(currentUser?.role)`
- `currentUser.isSuper` → `currentUser?.role === 'super'`
- `!currentUser.isSuper` → `currentUser?.role !== 'super'`

### Step 5: Update Messages page licensee filter

In `client/src/pages/Messages/scenes/Index/index.tsx`:
```js
// Before:
if (currentUser && !currentUser.isSuper && filters.licensee !== currentUser.licensee) {
  setFilters({ ...filters, licensee: currentUser.licensee })
}

// After:
const effectiveLicensee = currentUser?.role === 'super'
  ? activeLicensee?._id
  : currentUser?.licensee

if (currentUser && effectiveLicensee && filters.licensee !== effectiveLicensee) {
  setFilters({ ...filters, licensee: effectiveLicensee })
}
```

This uses `activeLicensee` from context for super users (set in task-04).

## Testing

- [ ] `GET /resources/messages?licensee=<other>` as non-super → returns only messages for own licensee
- [ ] `GET /resources/messages` as super → returns messages for `activeLicensee` selected
- [ ] `POST /resources/licensees` as `role: 'admin'` → returns 403
- [ ] `POST /resources/licensees` as `role: 'super'` → succeeds
- [ ] `GET /resources/contacts` as `role: 'agent'` → succeeds (read access)
- [ ] All existing controller tests still pass
- [ ] Frontend Messages page filters by `activeLicensee` for super user
- [ ] No `isAdmin` or `isSuper` references remain in production code (spec files exempted)
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Update `docs/kb/architecture/express-conventions.md` — add section on `authorize()` middleware usage
- [ ] Run `check-kb-index` after KB changes

## Completion Criteria

- [ ] All routes have appropriate role guards
- [ ] Server-side licensee filtering enforced
- [ ] `isAdmin`/`isSuper` removed from User schema
- [ ] All frontend `isAdmin`/`isSuper` references migrated to `role`
- [ ] Migration script instructions visible in plan notes (`scripts/migrate-user-roles.js`)
- [ ] All tests pass: `npx jest`
- [ ] `npx eslint .` produces no new errors
- [ ] KB doc updated
- [ ] All plan Success Criteria checked off
- [ ] Changes committed to `plan/local-chat-infra/phase-3/task-05-route-authorization` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

None — this phase has only one task.
