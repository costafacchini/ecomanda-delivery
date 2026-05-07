# Task: Backend — DashboardController + resend endpoint

**Plan**: Dashboard Widgets
**Phase**: 2
**Task ID (phase-local)**: task-02
**Task Path**: phase-2/task-02-backend
**Depends On**: phase-1/task-01-room-schema
**JIRA**: N/A

## Objective

Create `DashboardController` (role-aware stats) and add a `resend` action to `MessagesController`. Register both routes in `resources-routes.js`.

Both endpoints touch `resources-routes.js`, so they are intentionally in the same task to avoid merge conflicts.

## Context

### Auth & user resolution
JWT payload: `{ id: user._id }`. Middleware sets `req.userId`. Controller fetches user to resolve `isSuper` / `licensee`.

### Stats endpoint
`GET /resources/dashboard/stats` — returns role-branched JSON. Full response shapes in `overview.md`.

Key notes:
- `ended_today` now uses `closedAt` (available after Phase 1): `Room.countDocuments({ closedAt: { $gte: startOfDay, $lt: endOfDay } })`
- `avg_duration_seconds`: `avg(closedAt - createdAt)` in seconds for rooms closed today
- `avg_transfer_rate`: `(sent_today + failed_today) / 24` — messages per hour average
- `peak_throughput`: `Math.max(...per_hour.map(h => h.count))`, 0 if empty

### Resend endpoint
`POST /resources/messages/:id/resend`

Flow:
1. Find message by `_id`
2. Return 404 if not found
3. **Authorization**: if user is not super, verify `message.licensee.toString() === user.licensee.toString()` — return 403 if mismatch
4. Reset message state: set `sended = false`, clear `error = null`, clear `sendedAt = null`
5. Save the message
6. Re-add to Bull queue: `queueServer.addJob('send-message-to-messenger', { messageId: message._id })`
7. Return 200 with the updated message

> Before implementing step 6, read `src/app/services/SendMessageToMessenger.js` to confirm the expected `body` payload. If it expects more than `{ messageId }`, adjust accordingly.

`MessagesController` will need `messageRepository` and `queueServer` injected. Check current constructor — it only has `createMessagesQuery`. Add the new deps without breaking the existing `index` action.

### Aggregation pipelines (super stats)

```js
// Per-day (last 7 days)
[
  { $match: { createdAt: { $gte: sevenDaysAgo, $lt: endOfDay } } },
  { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
  { $sort: { _id: 1 } },
]

// Per-hour (today)
[
  { $match: { createdAt: { $gte: startOfDay, $lt: endOfDay } } },
  { $group: { _id: { $dateToString: { format: '%Y-%m-%dT%H', date: '$createdAt' } }, count: { $sum: 1 } } },
  { $sort: { _id: 1 } },
]

// Avg time in queue (messages sent today where sendedAt exists)
[
  { $match: { sendedAt: { $exists: true }, createdAt: { $gte: startOfDay, $lt: endOfDay } } },
  { $group: { _id: null, avg: { $avg: { $divide: [{ $subtract: ['$sendedAt', '$createdAt'] }, 1000] } } } },
]

// Avg messages per conversation (today)
[
  { $match: { room: { $exists: true }, createdAt: { $gte: startOfDay, $lt: endOfDay } } },
  { $group: { _id: '$room', count: { $sum: 1 } } },
  { $group: { _id: null, avg: { $avg: '$count' } } },
]

// Avg conversation duration (rooms closed today)
[
  { $match: { closedAt: { $gte: startOfDay, $lt: endOfDay } } },
  { $group: { _id: null, avg: { $avg: { $divide: [{ $subtract: ['$closedAt', '$createdAt'] }, 1000] } } } },
]
```

### Existing patterns
- Controller structure: `src/app/controllers/LicenseesController.js`
- Error shape: `{ errors: { message: err.toString() } }`
- DI wiring: `src/app/routes/resources-routes.js` composition root

## Before You Start

- [ ] Verify `phase-1/task-01-room-schema/status.md` shows `complete`
- [ ] `git switch main && git pull --rebase origin main`
- [ ] Create branch: `git switch -c plan/dashboard-widgets/phase-2/task-02-backend`
- [ ] Read `docs/kb/architecture/dependency-injection-runtime-wiring.md`
- [ ] Read `src/app/controllers/MessagesController.js` — understand current constructor
- [ ] Read `src/app/services/SendMessageToMessenger.js` — confirm resend payload shape
- [ ] Read `src/app/runtime/dependencies.js` — check if `roomRepository` is already exported
- [ ] Check `status.md` — must be `not-started`
- [ ] Mark `status.md` as `in-progress`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/DashboardController.js` | create | Stats action |
| `src/app/controllers/DashboardController.spec.js` | create | Unit specs |
| `src/app/controllers/MessagesController.js` | modify | Add `resend` action + inject `messageRepository` + `queueServer` |
| `src/app/controllers/MessagesController.spec.js` | modify | Add resend specs |
| `src/app/routes/resources-routes.js` | modify | Add DashboardController wiring + route; add resend route |
| `src/app/runtime/dependencies.js` | modify if needed | Add `roomRepository` if missing |

### Do NOT Modify

- `src/app/models/**` — owned by phase-1 (complete)
- `src/app/plugins/**` — owned by phase-1 (complete)
- `client/src/**` — owned by phase-3/task-03-frontend

## Implementation Steps

### Step 1: Check roomRepository in dependencies.js

If `roomRepository` is not exported from `src/app/runtime/dependencies.js`, add it following the same pattern as the other repositories.

### Step 2: Create DashboardController

Create `src/app/controllers/DashboardController.js` with constructor accepting `{ userRepository, licenseeRepository, contactRepository, messageRepository, roomRepository }`.

Implement `stats(req, res)`:
- Fetch user by `req.userId`; 404 if not found
- Compute `startOfDay`, `endOfDay`, `sevenDaysAgo`
- Branch on `user.isSuper` → call private `_superStats` or `_licenseeStats`
- Both private methods run all queries in `Promise.all`

See **Aggregation pipelines** section above for query details. Private methods return the plain object; `stats` wraps with `res.status(200).json(...)`.

**Super response shape:**
```js
{
  kind: 'super',
  licensees: { total, active, by_kind: { demo, free, paid } },
  message_volume: { per_day, per_hour, peak_throughput, avg_transfer_rate },
  delivery_rate: { sent_today, failed_today, sent_pct, failed_pct },
  queue: { pending_messages, avg_time_in_queue_seconds },
  conversations: { started_today, ended_today, avg_messages_per_conversation, avg_duration_seconds },
}
```

**Licensee response shape:**
```js
{
  kind: 'licensee',
  contacts: { total, in_chatbot },
  messages: { sent_today, failed_today, per_day },
}
```

### Step 3: Update MessagesController

Add to constructor: `messageRepository` and `queueServer`. Bind `this.resend = this.resend.bind(this)`.

Add `resend` action following the flow described in the Context section.

### Step 4: Update resources-routes.js

Add `roomRepository` to the `createRuntimeDependencies()` destructure if needed.

Import `DashboardController`. Add to composition root:
```js
const dashboardController = new DashboardController({
  userRepository, licenseeRepository, contactRepository, messageRepository, roomRepository,
})
```

Update `messagesController` instantiation to pass `messageRepository` and `queueServer`.

Add routes:
```js
router.get('/dashboard/stats', dashboardController.stats)
router.post('/messages/:id/resend', messagesController.resend)
```

### Step 5: Write specs

**DashboardController.spec.js** — 4 cases minimum:
1. Super user success: assert `kind: 'super'`, correct top-level keys, `peak_throughput = max(per_hour)`, percentages sum to 100
2. Licensee user success: assert `kind: 'licensee'`, all queries scoped to `user.licensee`
3. User not found: 404
4. Repository error: 500

**MessagesController.spec.js** additions — 4 cases:
1. Resend success (super user): finds message, resets fields, calls `queueServer.addJob`, returns 200
2. Resend success (licensee user, owns message): same, passes ownership check
3. Resend 403: licensee user attempts resend of another licensee's message
4. Resend 404: message not found

## Testing

- [ ] `npx jest src/app/controllers/DashboardController.spec.js` passes
- [ ] `npx jest src/app/controllers/MessagesController.spec.js` passes
- [ ] `npx jest` (full suite) passes
- [ ] `npx eslint .` reports no new errors

## Documentation / KB Updates

- [ ] No KB/doc updates required.
- [ ] If `roomRepository` was missing from `dependencies.js`, run `document-solution` after completing.

## Completion Criteria

- [ ] `GET /resources/dashboard/stats` returns correct shape for both user kinds
- [ ] `POST /resources/messages/:id/resend` re-queues the message and resets its state
- [ ] 403 returned when a licensee user attempts to resend another licensee's message
- [ ] All specs pass
- [ ] No lint errors
- [ ] Changes committed to `plan/dashboard-widgets/phase-2/task-02-backend`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- No parallel tasks in Phase 2.
