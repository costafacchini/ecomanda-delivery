# Task: Backend — dashboard endpoints + resend + Redis caching

**Plan**: Dashboard Widgets
**Phase**: 2
**Task ID (phase-local)**: task-02
**Task Path**: phase-2/task-02-backend
**Depends On**: phase-1/task-01-room-schema
**JIRA**: N/A

## Objective

Create `DashboardController` with 8 card-specific actions (5 super + 3 licensee), add a `resend` action to `MessagesController`, register all 9 routes in `resources-routes.js`, and add Redis caching (10 min TTL) to every dashboard action.

## Context

### Auth & user resolution
JWT payload: `{ id: user._id }`. Middleware sets `req.userId`. Each action fetches the user to resolve `isSuper` / `licensee`, then gates access:
- Super-only endpoints return `403` if `!user.isSuper`
- Licensee-only endpoints return `403` if `user.isSuper`

### Caching
`redisConnection` is exported from `src/config/redis.js` — import it directly into `DashboardController`. Pattern for every action:
```js
const cached = await redisConnection.get(cacheKey)
if (cached) return res.status(200).json(JSON.parse(cached))
// ... compute data ...
await redisConnection.setex(cacheKey, 600, JSON.stringify(data))
return res.status(200).json(data)
```

Cache keys:
- Super (global): `dashboard:super:licensees`, `dashboard:super:message-volume`, `dashboard:super:delivery-rate`, `dashboard:super:queue`, `dashboard:super:conversations`
- Licensee (per licensee): `dashboard:licensee:{licenseeId}:contacts`, `dashboard:licensee:{licenseeId}:messages-today`, `dashboard:licensee:{licenseeId}:messages-per-day`

### Date helpers (reused across actions)
```js
const now = new Date()
const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
const sevenDaysAgo = new Date(startOfDay.getTime() - 6 * 24 * 60 * 60 * 1000)
```

### Aggregation pipelines

**Per-day (7 days, optional licenseeId filter)**
```js
[
  { $match: { createdAt: { $gte: sevenDaysAgo, $lt: endOfDay }, ...(licenseeId ? { licensee: licenseeId } : {}) } },
  { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
  { $sort: { _id: 1 } },
]
```

**Per-hour (today, super only)**
```js
[
  { $match: { createdAt: { $gte: startOfDay, $lt: endOfDay } } },
  { $group: { _id: { $dateToString: { format: '%Y-%m-%dT%H', date: '$createdAt' } }, count: { $sum: 1 } } },
  { $sort: { _id: 1 } },
]
```

**Avg time in queue (today)**
```js
[
  { $match: { sendedAt: { $exists: true }, createdAt: { $gte: startOfDay, $lt: endOfDay } } },
  { $group: { _id: null, avg: { $avg: { $divide: [{ $subtract: ['$sendedAt', '$createdAt'] }, 1000] } } } },
]
```

**Avg messages per conversation (today)**
```js
[
  { $match: { room: { $exists: true }, createdAt: { $gte: startOfDay, $lt: endOfDay } } },
  { $group: { _id: '$room', count: { $sum: 1 } } },
  { $group: { _id: null, avg: { $avg: '$count' } } },
]
```

**Avg conversation duration (rooms closed today)**
```js
[
  { $match: { closedAt: { $gte: startOfDay, $lt: endOfDay } } },
  { $group: { _id: null, avg: { $avg: { $divide: [{ $subtract: ['$closedAt', '$createdAt'] }, 1000] } } } },
]
```

### Resend endpoint
`POST /resources/messages/:id/resend`
1. Fetch user + message by `req.params.id`; 404 if not found
2. If `!user.isSuper`: verify `message.licensee.toString() === user.licensee.toString()` → 403 if mismatch
3. Reset: `message.sended = false`, `message.error = null`, `message.sendedAt = null`
4. Save message
5. `queueServer.addJob('send-message-to-messenger', { messageId: message._id })`
6. Return 200 with updated message

> Before implementing step 5, read `src/app/services/SendMessageToMessenger.js` to confirm the expected `body` payload. Adjust if it expects more than `{ messageId }`.

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
- [ ] Read `src/app/runtime/dependencies.js` — check if `roomRepository` is exported
- [ ] Check `status.md` — must be `not-started`
- [ ] Mark `status.md` as `in-progress`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/DashboardController.js` | create | 8 actions + Redis caching |
| `src/app/controllers/DashboardController.spec.js` | create | Unit specs |
| `src/app/controllers/MessagesController.js` | modify | Add `resend` action |
| `src/app/controllers/MessagesController.spec.js` | modify | Add resend specs |
| `src/app/routes/resources-routes.js` | modify | 9 new routes + DI wiring |
| `src/app/runtime/dependencies.js` | modify if needed | Add `roomRepository` if missing |

### Do NOT Modify

- `src/app/models/**` — Phase 1 (complete)
- `src/app/plugins/**` — Phase 1 (complete)
- `client/src/**` — Phase 3

## Implementation Steps

### Step 1: Check roomRepository in dependencies.js

If not present, add it following the same pattern as the other repositories.

### Step 2: Create DashboardController

Create `src/app/controllers/DashboardController.js`. Constructor receives:
```js
{ userRepository, licenseeRepository, contactRepository, messageRepository, roomRepository, redisConnection }
```

Store all as `this.*`. Bind all 8 action methods in the constructor.

**Helper: `_resolveUser(req, res)`**
```js
async _resolveUser(req) {
  return await this.userRepository.findFirst({ _id: req.userId })
}
```

**Helper: `_cached(key, fn)`** — wraps the Redis get/compute/set pattern:
```js
async _cached(key, fn) {
  const cached = await this.redisConnection.get(key)
  if (cached) return JSON.parse(cached)
  const data = await fn()
  await this.redisConnection.setex(key, 600, JSON.stringify(data))
  return data
}
```

**Super actions (5)** — each follows: fetch user → check `isSuper` → check cache → compute → store cache → return

`licensees(req, res)`:
- Gate: `!user.isSuper` → 403
- Cache key: `dashboard:super:licensees`
- Queries (Promise.all): countDocuments for total, active, demo, free, paid
- Returns: `{ total, active, by_kind: { demo, free, paid } }`

`messageVolume(req, res)`:
- Gate: `!user.isSuper` → 403
- Cache key: `dashboard:super:message-volume`
- Queries: per-day pipeline, per-hour pipeline
- Computes: `peak_throughput = Math.max(...perHour.map(h => h.count))` (0 if empty), `avg_transfer_rate = parseFloat(((sentToday + failedToday) / 24).toFixed(2))`
- Note: needs `sentToday` + `failedToday` counts for avg_transfer_rate — include them in the Promise.all
- Returns: `{ per_day, per_hour, peak_throughput, avg_transfer_rate }`

`deliveryRate(req, res)`:
- Gate: `!user.isSuper` → 403
- Cache key: `dashboard:super:delivery-rate`
- Queries: countDocuments sended:true today, sended:false today
- Computes percentages (0 if total is 0)
- Returns: `{ sent_today, failed_today, sent_pct, failed_pct }`

`queue(req, res)`:
- Gate: `!user.isSuper` → 403
- Cache key: `dashboard:super:queue`
- Queries: countDocuments `{ sended: false, destination: 'to-messenger' }`, avg-time-in-queue pipeline
- Returns: `{ pending_messages, avg_time_in_queue_seconds }`

`conversations(req, res)`:
- Gate: `!user.isSuper` → 403
- Cache key: `dashboard:super:conversations`
- Queries: Room.countDocuments started today, Room.countDocuments `{ closedAt: { $gte, $lt } }`, avg-msg-per-conv pipeline, avg-duration pipeline
- Returns: `{ started_today, ended_today, avg_messages_per_conversation, avg_duration_seconds }`

**Licensee actions (3)** — cache key scoped by `user.licensee`

`contacts(req, res)`:
- Gate: `user.isSuper` → 403
- Cache key: `dashboard:licensee:${user.licensee}:contacts`
- Queries: countDocuments total, countDocuments talkingWithChatBot:true
- Returns: `{ total, in_chatbot }`

`messagesToday(req, res)`:
- Gate: `user.isSuper` → 403
- Cache key: `dashboard:licensee:${user.licensee}:messages-today`
- Queries: countDocuments sended:true today, sended:false today (both filtered by licensee)
- Returns: `{ sent_today, failed_today, sent_pct, failed_pct }`

`messagesPerDay(req, res)`:
- Gate: `user.isSuper` → 403
- Cache key: `dashboard:licensee:${user.licensee}:messages-per-day`
- Queries: per-day pipeline with `licensee: user.licensee` filter
- Returns: `{ per_day }`

### Step 3: Update MessagesController

Add `messageRepository` and `queueServer` to constructor. Bind `this.resend`. Implement `resend(req, res)` per the flow in the Context section.

### Step 4: Update resources-routes.js

Import `DashboardController` and `redisConnection`. Add `roomRepository` to destructure if needed. Instantiate:
```js
const dashboardController = new DashboardController({
  userRepository, licenseeRepository, contactRepository, messageRepository, roomRepository, redisConnection,
})
```

Update `messagesController` to receive `messageRepository` and `queueServer`.

Add routes:
```js
router.get('/dashboard/licensees', dashboardController.licensees)
router.get('/dashboard/message-volume', dashboardController.messageVolume)
router.get('/dashboard/delivery-rate', dashboardController.deliveryRate)
router.get('/dashboard/queue', dashboardController.queue)
router.get('/dashboard/conversations', dashboardController.conversations)
router.get('/dashboard/contacts', dashboardController.contacts)
router.get('/dashboard/messages-today', dashboardController.messagesToday)
router.get('/dashboard/messages-per-day', dashboardController.messagesPerDay)
router.post('/messages/:id/resend', messagesController.resend)
```

### Step 5: Write specs

**DashboardController.spec.js** — per action, cover:
- Cache hit: `redisConnection.get` returns JSON → response served from cache, no DB queries
- Cache miss: DB queries run, result stored in Redis, response returned
- Wrong user kind: 403
- User not found: 404
- Repository error: 500

**MessagesController.spec.js** additions:
1. Resend success (super): resets fields, enqueues, returns 200
2. Resend success (licensee, owns message): passes ownership check
3. Resend 403: licensee attempts cross-licensee resend
4. Resend 404: message not found

## Testing

- [ ] `npx jest src/app/controllers/DashboardController.spec.js` passes
- [ ] `npx jest src/app/controllers/MessagesController.spec.js` passes
- [ ] `npx jest` (full suite) passes
- [ ] `npx eslint .` reports no new errors

## Documentation / KB Updates

- [ ] No KB/doc updates required — Redis is already used in the project; caching pattern is self-documented in controller.
- [ ] If `roomRepository` was missing from `dependencies.js`, run `document-solution`.

## Completion Criteria

- [ ] All 8 dashboard endpoints return correct data and gate on user kind
- [ ] Repeat requests within 10 minutes are served from Redis cache (no DB hit)
- [ ] Resend resets message state and re-queues
- [ ] 403 on cross-licensee resend attempt
- [ ] All specs pass
- [ ] No lint errors
- [ ] Changes committed to `plan/dashboard-widgets/phase-2/task-02-backend`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- No parallel tasks in Phase 2.
