# Task: Room schema — add closedAt field

**Plan**: Dashboard Widgets
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-room-schema
**Depends On**: None
**JIRA**: N/A

## Objective

Add `closedAt: Date` to the Room schema and set it wherever `room.closed = true` is written, so that Phase 2 can use it for accurate conversation-end metrics.

## Context

`Room` model (`src/app/models/Room.js`) currently has `closed: Boolean` and `timestamps: true` (`createdAt`, `updatedAt`). `updatedAt` is not a reliable proxy for close time because it updates on any field change.

`closedAt` must be set **at the same moment** `room.closed = true` is written. A grep for `\.closed\s*=\s*true` / `closed: true` across the plugins reveals 5 locations in 3 files:

| File | Lines | Context |
|------|-------|---------|
| `src/app/plugins/chats/Rocketchat.js` | ~172 | Closes room when chat is reset |
| `src/app/plugins/chats/Rocketchat.js` | ~197 | Closes room on explicit close event |
| `src/app/plugins/chats/Chatwoot.js` | ~336 | Closes room on conversation close |
| `src/app/plugins/chats/Chatwoot.js` | ~469 | Closes room on omnichannel resolve |
| `src/app/plugins/chatbots/Landbot.js` | ~12 | Closes room when chatbot flow ends |

In each location, after `room.closed = true` add `room.closedAt = new Date()`.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Create branch: `git switch -c plan/dashboard-widgets/phase-1/task-01-room-schema`
- [ ] Read `src/app/models/Room.js` to understand the current schema
- [ ] Read each of the 3 plugin files above to locate the exact lines
- [ ] Check `status.md` — must be `not-started`
- [ ] Mark `status.md` as `in-progress`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/models/Room.js` | modify | Add `closedAt: Date` field |
| `src/app/plugins/chats/Rocketchat.js` | modify | Set `room.closedAt = new Date()` at both close sites |
| `src/app/plugins/chats/Chatwoot.js` | modify | Set `room.closedAt = new Date()` at both close sites |
| `src/app/plugins/chatbots/Landbot.js` | modify | Set `room.closedAt = new Date()` at the close site |

### Do NOT Modify

- `src/app/controllers/**` — owned by phase-2/task-02-backend
- `src/app/routes/**` — owned by phase-2/task-02-backend
- `client/src/**` — owned by phase-3/task-03-frontend

## Implementation Steps

### Step 1: Update Room model

In `src/app/models/Room.js`, add to the schema definition:
```js
closedAt: { type: Date },
```

No default, no required — it is only populated when the room is actually closed.

### Step 2: Update close sites

In each of the 5 locations, immediately after `room.closed = true`, add:
```js
room.closedAt = new Date()
```

Do not change any other logic in those files.

### Step 3: Verify existing specs still pass

The existing specs in `Rocketchat.spec.js`, `Chatwoot.spec.js`, and `Landbot.spec.js` assert `closed: true` — they should continue to pass unchanged. If any spec also checks the full saved object shape and fails because of the new field, update the expectation minimally (add `closedAt: expect.any(Date)`).

## Testing

- [ ] `npx jest src/app/plugins/chats/Rocketchat.spec.js` passes
- [ ] `npx jest src/app/plugins/chats/Chatwoot.spec.js` passes
- [ ] `npx jest src/app/plugins/chatbots/Landbot.spec.js` passes
- [ ] `npx jest` (full suite) passes
- [ ] `npx eslint .` reports no new errors

## Documentation / KB Updates

- [ ] No KB/doc updates required — additive schema change, no architectural novelty.

## Completion Criteria

- [ ] `Room` schema has `closedAt: Date`
- [ ] All 5 close sites set `room.closedAt = new Date()`
- [ ] All existing room/plugin specs pass
- [ ] Changes committed to `plan/dashboard-widgets/phase-1/task-01-room-schema`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- Phase 2 task does not touch any of these files — no overlap.
