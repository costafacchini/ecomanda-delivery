# Task: User role system + authorize middleware

**Plan**: Local Chat Infrastructure
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-user-role-system
**Depends On**: None
**JIRA**: N/A

## Objective

Add `role` field to `User`, create a one-shot migration script, and add an `authorize(...roles)` middleware function to `resources-routes.ts` that replaces the existing `requireSuper` pattern.

## Context

**Current state:**
- `User` has `isAdmin: Boolean` (UI-only, no server guard) and `isSuper: Boolean` (checked by `requireSuper` in `resources-routes.ts`)
- `requireSuper` loads user from DB and checks `user.isSuper`
- `req.userId` is set by `authenticate` — `req.user` is NOT populated today

**After this task:**
- `User` gains `role: 'agent' | 'supervisor' | 'admin' | 'super'`
- `isAdmin` and `isSuper` are kept in the schema as deprecated aliases (do NOT remove — client-side code and existing guards still reference them; removal is task-05)
- New `authorize(...roles)` middleware populates `req.user` (full user object) and checks role
- `requireSuper` is kept as an alias for `authorize('super')` for backward compat during the transition

**Migration (`scripts/migrate-user-roles.js`):** (scripts use plain Node.js — `.js` extension intentional)
- `costafacchini@gmail.com` → `role: 'super'`
- Any other user with `isSuper: true` → `role: 'super'`
- Users with `isAdmin: true` (and not super) → `role: 'admin'`
- All remaining users → `role: 'agent'`

> **IMPORTANT**: This script must be run manually by the developer (`node scripts/migrate-user-roles.js`) after deployment. Never auto-run at server startup. Per CLAUDE.md: provide the script; do not execute DB changes.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/local-chat-infra/phase-1/task-01-user-role-system`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Read `src/app/models/User.ts` (full file)
- [ ] Read `src/app/routes/resources-routes.ts` lines 108–145 (authenticate + requireSuper + route guards)
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/models/User.ts` | modify | Add `role` field |
| `src/app/models/User.spec.ts` | modify | Add role field tests |
| `src/app/routes/resources-routes.ts` | modify | Add `authorize()` function; keep `requireSuper` as alias |
| `scripts/migrate-user-roles.js` | create | One-shot migration — run manually (plain Node.js script) |

### Do NOT Modify

- `src/app/models/Room.ts` — owned by phase-1/task-02-room-model
- `src/app/plugins/chats/` — owned by phase-2/task-03-local-chat-plugin
- `client/src/` — owned by phase-2/task-04-frontend-super-flow and phase-3/task-05-route-authorization

## Implementation Steps

### Step 1: Add `role` to `User` schema

In `src/app/models/User.ts`, add after `isSuper`:

```js
role: {
  type: String,
  enum: ['agent', 'supervisor', 'admin', 'super'],
  default: 'agent',
},
```

Keep `isAdmin` and `isSuper` as-is — they are deprecated but still referenced by existing code. They will be removed in phase-3/task-05-route-authorization after all references are migrated.

### Step 2: Add `authorize()` to `resources-routes.ts`

Add after the existing `requireSuper` function:

```ts
function authorize(...roles: string[]) {
  return async (req: any, res: any, next: any) => {
    try {
      const user = await userRepository.findFirst({ _id: req.userId })
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Acesso negado.' })
      }
      req.user = user
      next()
    } catch (err) {
      next(err)
    }
  }
}
```

Update `requireSuper` to delegate:
```ts
function requireSuper(req: any, res: any, next: any) {
  return authorize('super')(req, res, next)
}
```

This keeps all existing routes working while making `authorize()` available for new route guards.

### Step 3: Create `scripts/migrate-user-roles.js`

```js
import 'dotenv/config'
import mongoose from 'mongoose'
import User from '../src/app/models/User'

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected. Running role migration...')

  // Super: costafacchini@gmail.com + any other isSuper:true
  await User.updateMany({ isSuper: true }, { $set: { role: 'super' } })

  // Admin: isAdmin:true and not super
  await User.updateMany({ isAdmin: true, isSuper: false }, { $set: { role: 'admin' } })

  // Agent: everything else (already the default, but explicit for safety)
  await User.updateMany(
    { role: { $exists: false } },
    { $set: { role: 'agent' } }
  )

  const counts = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }])
  console.log('Migration complete:', counts)

  await mongoose.disconnect()
}

migrate().catch(console.error)
```

> **To run**: `node scripts/migrate-user-roles.js` (requires `MONGODB_URI` in env)

## Testing

- [ ] `User` model: `role` defaults to `'agent'` when not provided
- [ ] `User` model: invalid role value fails validation
- [ ] `authorize('super')`: returns 403 when user has `role: 'agent'`
- [ ] `authorize('admin', 'super')`: passes for `role: 'admin'`
- [ ] `authorize('admin', 'super')`: passes for `role: 'super'`
- [ ] `authorize('admin', 'super')`: returns 403 for `role: 'agent'`
- [ ] `req.user` is populated after `authorize()` passes
- [ ] `requireSuper` still blocks non-super (backward compat)
- [ ] All existing `User` model tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc updates required at this task

## Completion Criteria

- [ ] `role` field added to User model with correct enum and default
- [ ] `authorize()` middleware functional
- [ ] `requireSuper` still works (delegates to `authorize('super')`)
- [ ] Migration script created with clear run instructions
- [ ] All tests pass: `npx jest src/app/models/User.spec.ts`
- [ ] `npx eslint src/app/models/User.ts src/app/routes/resources-routes.ts scripts/` passes
- [ ] Changes committed to `plan/local-chat-infra/phase-1/task-01-user-role-system` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-02 modifies only `Room.ts`. No overlap with this task.
