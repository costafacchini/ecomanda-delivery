# ~~SUPERSEDED~~ — see phase-2/task-02-backend

# Task: Backend stats endpoint

**Plan**: Dashboard Widgets
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-backend-stats-endpoint
**Depends On**: None
**JIRA**: N/A

## Objective

Create `DashboardController` with a `stats` action that resolves the calling user's kind and returns a role-scoped JSON payload. Register `GET /resources/dashboard/stats` in the resources router.

## Context

**Auth:** JWT contains only `{ id: user._id }`. Middleware sets `req.userId`. Controller must fetch the user to resolve `isSuper` and `licensee`.

**User model fields:** `isSuper: Boolean`, `licensee: ObjectId ref Licensee` (required when `!isSuper`).

**Data sources — all MongoDB:**
- `licenseeRepository.model()` — licensee counts
- `messageRepository.model()` — all message metrics
- `contactRepository.model()` — contact counts (licensee path only)
- `roomRepository` — NOT currently in the resources-routes composition root; must be added (see Step 2)

**Existing controller pattern:** `src/app/controllers/LicenseesController.js` — constructor injection, method binding, `{ errors: { message } }` error shape.

---

## API Contract

See `overview.md` for full response shapes. Key computed fields:

| Field | Computation |
|-------|-------------|
| `peak_throughput` | `Math.max(...per_hour.map(h => h.count))` |
| `avg_transfer_rate` | `totalMessages24h / 24` (messages per hour average) |
| `sent_pct` | `sent / (sent + failed) * 100` — return `0` if both are 0 |
| `failed_pct` | `failed / (sent + failed) * 100` |
| `pending_messages` | `Message.countDocuments({ sended: false, destination: 'to-messenger' })` |
| `avg_time_in_queue_seconds` | `avg(sendedAt - createdAt)` in seconds, for messages where `sendedAt` exists |
| `started_today` | `Room.countDocuments({ createdAt: { $gte: startOfDay, $lt: endOfDay } })` |
| `ended_today` | `Room.countDocuments({ closed: true, updatedAt: { $gte: startOfDay, $lt: endOfDay } })` |
| `avg_messages_per_conversation` | `avg(message count per room)` via aggregation |

---

## Aggregation Pipelines

### Per-day (last 7 days, optional licensee filter)
```js
const perDayPipeline = (licenseeId) => [
  { $match: { createdAt: { $gte: sevenDaysAgo, $lt: endOfDay }, ...(licenseeId ? { licensee: licenseeId } : {}) } },
  { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
  { $sort: { _id: 1 } },
]
```

### Per-hour (last 24h, super only)
```js
const perHourPipeline = [
  { $match: { createdAt: { $gte: startOfDay, $lt: endOfDay } } },
  { $group: { _id: { $dateToString: { format: '%Y-%m-%dT%H', date: '$createdAt' } }, count: { $sum: 1 } } },
  { $sort: { _id: 1 } },
]
```

### Average time in queue (super only)
```js
const avgTimeInQueuePipeline = [
  { $match: { sendedAt: { $exists: true }, createdAt: { $gte: startOfDay, $lt: endOfDay } } },
  { $group: { _id: null, avg: { $avg: { $divide: [{ $subtract: ['$sendedAt', '$createdAt'] }, 1000] } } } },
]
```

### Average messages per conversation (super only)
```js
const avgMsgPerConvPipeline = [
  { $match: { room: { $exists: true }, createdAt: { $gte: startOfDay, $lt: endOfDay } } },
  { $group: { _id: '$room', count: { $sum: 1 } } },
  { $group: { _id: null, avg: { $avg: '$count' } } },
]
```

---

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Create branch: `git switch -c plan/dashboard-widgets/phase-1/task-01-backend-stats-endpoint`
- [ ] Read `docs/kb/architecture/dependency-injection-runtime-wiring.md`
- [ ] Read `docs/kb/architecture/express-conventions.md`
- [ ] Read `src/app/controllers/LicenseesController.js`
- [ ] Read `src/app/routes/resources-routes.js` — understand `createRuntimeDependencies()` and what repositories are already destructured
- [ ] Check `status.md` — must be `not-started`
- [ ] Mark `status.md` as `in-progress`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/DashboardController.js` | create | New controller |
| `src/app/controllers/DashboardController.spec.js` | create | Unit specs |
| `src/app/routes/resources-routes.js` | modify | Add roomRepository destructure, DashboardController import + wiring + route |

### Do NOT Modify

- `client/src/**` — owned by phase-2/task-02-frontend-dashboard
- Any other existing controller files

## Implementation Steps

### Step 1: Check if roomRepository exists in createRuntimeDependencies

Open `src/app/runtime/dependencies.js` and check whether `roomRepository` is already exported. If not, add it following the same pattern as other repositories. This is a prerequisite for the conversation metrics.

### Step 2: Update resources-routes.js

Add `roomRepository` to the destructure from `createRuntimeDependencies()` if needed.

Add import:
```js
import { DashboardController } from '../controllers/DashboardController.js'
```

Add to composition root:
```js
const dashboardController = new DashboardController({
  userRepository,
  licenseeRepository,
  contactRepository,
  messageRepository,
  roomRepository,
})
```

Add route (after `router.get('/messages', messagesController.index)`):
```js
router.get('/dashboard/stats', dashboardController.stats)
```

### Step 3: Create DashboardController

Create `src/app/controllers/DashboardController.js`:

```js
class DashboardController {
  constructor({ userRepository, licenseeRepository, contactRepository, messageRepository, roomRepository } = {}) {
    this.userRepository = userRepository
    this.licenseeRepository = licenseeRepository
    this.contactRepository = contactRepository
    this.messageRepository = messageRepository
    this.roomRepository = roomRepository
    this.stats = this.stats.bind(this)
  }

  async stats(req, res) {
    try {
      const user = await this.userRepository.findFirst({ _id: req.userId })
      if (!user) return res.status(404).send({ errors: { message: 'Usuário não encontrado' } })

      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      const sevenDaysAgo = new Date(startOfDay.getTime() - 6 * 24 * 60 * 60 * 1000)

      if (user.isSuper) {
        return res.status(200).json(await this._superStats(startOfDay, endOfDay, sevenDaysAgo))
      }

      return res.status(200).json(await this._licenseeStats(user.licensee, startOfDay, endOfDay, sevenDaysAgo))
    } catch (err) {
      return res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async _superStats(startOfDay, endOfDay, sevenDaysAgo) {
    const perDayPipeline = [
      { $match: { createdAt: { $gte: sevenDaysAgo, $lt: endOfDay } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]
    const perHourPipeline = [
      { $match: { createdAt: { $gte: startOfDay, $lt: endOfDay } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%dT%H', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]
    const avgTimeInQueuePipeline = [
      { $match: { sendedAt: { $exists: true }, createdAt: { $gte: startOfDay, $lt: endOfDay } } },
      { $group: { _id: null, avg: { $avg: { $divide: [{ $subtract: ['$sendedAt', '$createdAt'] }, 1000] } } } },
    ]
    const avgMsgPerConvPipeline = [
      { $match: { room: { $exists: true }, createdAt: { $gte: startOfDay, $lt: endOfDay } } },
      { $group: { _id: '$room', count: { $sum: 1 } } },
      { $group: { _id: null, avg: { $avg: '$count' } } },
    ]

    const [
      total, active, demo, free, paid,
      sentToday, failedToday,
      perDay, perHour, avgTimeResult, avgMsgResult,
      pendingMessages,
      startedToday, endedToday,
    ] = await Promise.all([
      this.licenseeRepository.model().countDocuments({}),
      this.licenseeRepository.model().countDocuments({ active: true }),
      this.licenseeRepository.model().countDocuments({ licenseKind: 'demo' }),
      this.licenseeRepository.model().countDocuments({ licenseKind: 'free' }),
      this.licenseeRepository.model().countDocuments({ licenseKind: 'paid' }),
      this.messageRepository.model().countDocuments({ sended: true, createdAt: { $gte: startOfDay, $lt: endOfDay } }),
      this.messageRepository.model().countDocuments({ sended: false, createdAt: { $gte: startOfDay, $lt: endOfDay } }),
      this.messageRepository.model().aggregate(perDayPipeline),
      this.messageRepository.model().aggregate(perHourPipeline),
      this.messageRepository.model().aggregate(avgTimeInQueuePipeline),
      this.messageRepository.model().aggregate(avgMsgPerConvPipeline),
      this.messageRepository.model().countDocuments({ sended: false, destination: 'to-messenger' }),
      this.roomRepository.model().countDocuments({ createdAt: { $gte: startOfDay, $lt: endOfDay } }),
      this.roomRepository.model().countDocuments({ closed: true, updatedAt: { $gte: startOfDay, $lt: endOfDay } }),
    ])

    const total24h = sentToday + failedToday
    const perHourMapped = perHour.map(({ _id, count }) => ({ hour: _id, count }))

    return {
      kind: 'super',
      licensees: { total, active, by_kind: { demo, free, paid } },
      message_volume: {
        per_day: perDay.map(({ _id, count }) => ({ date: _id, count })),
        per_hour: perHourMapped,
        peak_throughput: perHourMapped.length ? Math.max(...perHourMapped.map((h) => h.count)) : 0,
        avg_transfer_rate: total24h > 0 ? parseFloat((total24h / 24).toFixed(2)) : 0,
      },
      delivery_rate: {
        sent_today: sentToday,
        failed_today: failedToday,
        sent_pct: total24h > 0 ? parseFloat(((sentToday / total24h) * 100).toFixed(1)) : 0,
        failed_pct: total24h > 0 ? parseFloat(((failedToday / total24h) * 100).toFixed(1)) : 0,
      },
      queue: {
        pending_messages: pendingMessages,
        avg_time_in_queue_seconds: avgTimeResult[0] ? parseFloat(avgTimeResult[0].avg.toFixed(2)) : 0,
      },
      conversations: {
        started_today: startedToday,
        ended_today: endedToday,
        avg_messages_per_conversation: avgMsgResult[0] ? parseFloat(avgMsgResult[0].avg.toFixed(1)) : 0,
      },
    }
  }

  async _licenseeStats(licenseeId, startOfDay, endOfDay, sevenDaysAgo) {
    const perDayPipeline = [
      { $match: { licensee: licenseeId, createdAt: { $gte: sevenDaysAgo, $lt: endOfDay } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]

    const [totalContacts, inChatbot, sentToday, failedToday, perDay] = await Promise.all([
      this.contactRepository.model().countDocuments({ licensee: licenseeId }),
      this.contactRepository.model().countDocuments({ licensee: licenseeId, talkingWithChatBot: true }),
      this.messageRepository.model().countDocuments({ licensee: licenseeId, sended: true, createdAt: { $gte: startOfDay, $lt: endOfDay } }),
      this.messageRepository.model().countDocuments({ licensee: licenseeId, sended: false, createdAt: { $gte: startOfDay, $lt: endOfDay } }),
      this.messageRepository.model().aggregate(perDayPipeline),
    ])

    return {
      kind: 'licensee',
      contacts: { total: totalContacts, in_chatbot: inChatbot },
      messages: {
        sent_today: sentToday,
        failed_today: failedToday,
        per_day: perDay.map(({ _id, count }) => ({ date: _id, count })),
      },
    }
  }
}

export { DashboardController }
```

### Step 4: Write specs

Create `src/app/controllers/DashboardController.spec.js`. Cover:

1. **Super user — success**: mock all repositories; assert `kind: 'super'`, correct top-level keys, `peak_throughput` equals max of `per_hour` counts, percentages sum to 100.
2. **Licensee user — success**: mock user with `isSuper: false`; assert `kind: 'licensee'`, `countDocuments` called with `{ licensee: user.licensee, ... }`.
3. **User not found**: `findFirst` returns null → HTTP 404.
4. **Repository error**: `findFirst` throws → HTTP 500 with `errors.message`.

## Testing

- [ ] `npx jest src/app/controllers/DashboardController.spec.js` passes
- [ ] `npx jest` (full suite) passes
- [ ] `npx eslint .` reports no new errors

## Documentation / KB Updates

- [ ] No KB/doc updates required — follows existing patterns.
- [ ] If `roomRepository` was missing from `dependencies.js` and had to be added, run `document-solution` after completing the task.

## Completion Criteria

- [ ] `GET /resources/dashboard/stats` returns correct shape for both user kinds
- [ ] All 4 spec cases pass
- [ ] No lint errors
- [ ] Changes committed to `plan/dashboard-widgets/phase-1/task-01-backend-stats-endpoint`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- Phase 2 touches `client/src/**` only — no overlap.
