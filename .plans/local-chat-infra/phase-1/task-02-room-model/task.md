# Task: Room model: agent + status fields

**Plan**: Local Chat Infrastructure
**Phase**: 1
**Task ID (phase-local)**: task-02
**Task Path**: phase-1/task-02-room-model
**Depends On**: None
**JIRA**: N/A

## Objective

Add `agent` (ref: User) and `status` (`pending | open | closed`) to the Room model. Keep the existing `closed` boolean in sync via a pre-save hook so existing plugins (Chatwoot, Crisp, etc.) continue working unchanged.

## Context

**Current `Room` schema:**
```js
{ roomId, token, closed (bool), closedAt, contact }
```

**After this task:**
```js
{ roomId, token, closed (bool), closedAt, contact,
  agent (ObjectId → User, nullable),
  status ('pending' | 'open' | 'closed', default: 'pending') }
```

**Compatibility strategy:** Keep `closed` and `closedAt` for backward compat. Existing plugins set `room.closed = true; room.closedAt = new Date()` directly — these must continue to work. A pre-save hook syncs `status` from `closed` when `agent` is absent (legacy path), and syncs `closed` from `status` when the LocalChat plugin uses the new path.

The sync rules:
- If `status` is set to `'closed'` → set `closed = true`, `closedAt = closedAt || new Date()`
- If `status` is set to `'open'` or `'pending'` → set `closed = false`, `closedAt = undefined`
- If `closed` is set to `true` (legacy path) and `status` is not explicitly `'closed'` → set `status = 'closed'`

Existing rooms without `agent` or `status` will have `agent: null` and `status: 'pending'` after the schema update (Mongoose default). This is acceptable — old rooms are effectively "pending" until the LocalChat plugin is active.

Read `src/app/plugins/chats/Chatwoot.js` lines 325-355 (`closeChat`) and the `roomRepository` usage to understand all callsites before modifying.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/local-chat-infra/phase-1/task-02-room-model`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Read `src/app/models/Room.js` (full file)
- [ ] Read `src/app/plugins/chats/Chatwoot.js` lines 325–355 (`closeChat`)
- [ ] Read `src/app/repositories/room.js` (full file)
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/models/Room.js` | modify | Add `agent`, `status`; sync hook |
| `src/app/models/Room.spec.js` | modify | Add field and sync tests |
| `src/app/repositories/room.js` | modify | Add `findOpenForContact(contactId)` helper |

### Do NOT Modify

- `src/app/models/User.js` — owned by phase-1/task-01-user-role-system
- `src/app/plugins/chats/Chatwoot.js` — read-only; backward compat is maintained via the sync hook
- `src/app/plugins/chats/LocalChat.js` — owned by phase-2/task-03-local-chat-plugin (does not exist yet)

## Implementation Steps

### Step 1: Add `agent` and `status` to `Room` schema

```js
agent: {
  type: ObjectId,
  ref: 'User',
  default: null,
},
status: {
  type: String,
  enum: ['pending', 'open', 'closed'],
  default: 'pending',
},
```

### Step 2: Update the pre-save hook with sync logic

Replace the existing pre-save hook (which only auto-generates `_id`) with one that also syncs `closed` ↔ `status`:

```js
roomSchema.pre('save', function () {
  if (!this._id) {
    this._id = new mongoose.Types.ObjectId()
  }

  // Sync status → closed (new path: LocalChat sets status)
  if (this.isModified('status')) {
    if (this.status === 'closed') {
      this.closed = true
      if (!this.closedAt) this.closedAt = new Date()
    } else {
      this.closed = false
      this.closedAt = undefined
    }
  }

  // Sync closed → status (legacy path: Chatwoot/Crisp set closed directly)
  if (this.isModified('closed') && !this.isModified('status')) {
    this.status = this.closed ? 'closed' : 'open'
  }
})
```

### Step 3: Add `findOpenForContact` to room repository

```js
async findOpenForContact(contactId) {
  return this.findFirst({ contact: contactId, closed: false })
}
```

This helper is used by `LocalChat.sendMessage()` (task-03) to find an existing open conversation.

## Testing

- [ ] `status` defaults to `'pending'` on new rooms
- [ ] `agent` defaults to `null` on new rooms
- [ ] Setting `status = 'closed'` syncs `closed = true` and sets `closedAt`
- [ ] Setting `status = 'open'` syncs `closed = false` and clears `closedAt`
- [ ] Setting `closed = true` directly (legacy) syncs `status = 'closed'`
- [ ] Setting `closed = false` directly (legacy) syncs `status = 'open'`
- [ ] Existing room with `closed: false` (no `status`) defaults to `status: 'pending'`
- [ ] `findOpenForContact` returns the open room for a contact
- [ ] All existing `Room.spec.js` tests still pass (Chatwoot `closeChat` path is unaffected)
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc updates required at this task

## Completion Criteria

- [ ] `agent` and `status` fields added with sync hook
- [ ] `findOpenForContact` added to repository
- [ ] All tests pass: `npx jest src/app/models/Room.spec.js`
- [ ] `npx eslint src/app/models/Room.js src/app/repositories/room.js` passes
- [ ] Changes committed to `plan/local-chat-infra/phase-1/task-02-room-model` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-01 modifies `User.js` only. No overlap with this task.
