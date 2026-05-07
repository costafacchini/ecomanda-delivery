# ~~SUPERSEDED~~ — see phase-3/task-03-frontend

# Task: Frontend dashboard widgets

**Plan**: Dashboard Widgets
**Phase**: 2
**Task ID (phase-local)**: task-02
**Task Path**: phase-2/task-02-frontend-dashboard
**Depends On**: phase-1/task-01-backend-stats-endpoint
**JIRA**: N/A

## Objective

Replace the empty Dashboard stub with role-aware stat widgets. The `kind` field in the API response drives which layout is rendered.

## Context

**Dashboard page**: `client/src/pages/Dashboard/index.js` — currently `<h1>Dashboard</h1>`.

**Service pattern**: `client/src/services/licensee.js` — `getToken()` → header → `api().get(url, { headers })`.

**UI stack**: Bootstrap 5 + Bootswatch Flatly. No new library installs. Use Bootstrap card grid and plain `<table>` for tabular data.

---

## Widget Specs

### Super user layout

**Row 1 — Licensees (1 card)**
- Total / Active count
- By-kind breakdown: demo / free / paid

**Row 2 — Message Volume (1 card)**
- Per-day table (last 7 days): date | count
- Per-hour table (today): hour | count
- Peak throughput: `peak_throughput` msgs/hr
- Avg transfer rate: `avg_transfer_rate` msgs/hr

**Row 3 — Delivery Rate (1 card)**
- Sent today: `sent_today` (`sent_pct`%)
- Failed today: `failed_today` (`failed_pct`%) — **this card section is clickable** (deferred: see note below)

**Row 4 — Queue (1 card)**
- Pending messages: `pending_messages`
- Avg time in queue: `avg_time_in_queue_seconds`s

**Row 5 — Conversations (1 card)**
- Started today: `started_today`
- Ended today: `ended_today`
- Avg messages/conversation: `avg_messages_per_conversation`

> **Deferred**: The failed-messages clickable/resend interaction is not implemented in this task — the open decision on resend strategy must be resolved first (see `overview.md`). Render the failed count as a plain stat for now; add a `// TODO: make clickable when resend strategy is decided` comment.

---

### Licensee user layout

**Row 1 — Contacts (1 card)**
- Total contacts
- Currently in chatbot

**Row 2 — Messages Today (1 card)**
- Sent: `sent_today`
- Failed: `failed_today`

**Row 3 — Messages per Day (1 card)**
- Table: date | count (last 7 days)

---

## Before You Start

- [ ] Verify `phase-1/task-01-backend-stats-endpoint/status.md` shows `complete`
- [ ] `git switch main && git pull --rebase origin main`
- [ ] Create branch: `git switch -c plan/dashboard-widgets/phase-2/task-02-frontend-dashboard`
- [ ] Read `client/src/services/licensee.js` — confirm service pattern
- [ ] Read `client/src/pages/Reports/Billing/scenes/Index/index.js` — confirm page pattern
- [ ] Check `status.md` — must be `not-started`
- [ ] Mark `status.md` as `in-progress`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/services/dashboard.js` | create | `getDashboardStats()` |
| `client/src/pages/Dashboard/index.js` | modify | Replace stub with widgets |

### Do NOT Modify

- `src/app/**` — backend complete; leave as-is
- Any other client pages or services

## Implementation Steps

### Step 1: Create service

`client/src/services/dashboard.js`:
```js
import { getToken } from './auth'
import api from './api'

function getDashboardStats() {
  const headers = { 'x-access-token': getToken() }
  return api().get('resources/dashboard/stats', { headers })
}

export { getDashboardStats }
```

### Step 2: Implement Dashboard page

State: `stats` (null), `loading` (true), `error` (null).

`useEffect` on mount → `getDashboardStats()` → set state. Render:
- `loading`: spinner / "Carregando..."
- `error`: dismissible Bootstrap alert
- `stats.kind === 'super'`: super layout (5 rows of cards)
- `stats.kind === 'licensee'`: licensee layout (3 cards)

Keep all markup inline. Extract only if the per-day/per-hour tables appear in both layouts and reducing the repetition is obviously cleaner — a small `<DayTable rows={...} />` helper is acceptable in that case only.

### Step 3: Manual smoke

`yarn run dev`. Log in as super user and licensee user. Confirm correct card sets, spinner, and no console errors.

## Testing

- [ ] `npx jest` (full suite) passes
- [ ] `npx eslint .` reports no new errors
- [ ] Manual smoke: both layouts render correctly with real data

## Documentation / KB Updates

- [ ] No KB/doc updates required.

## Completion Criteria

- [ ] Super layout: 5 widget sections with real data
- [ ] Licensee layout: 3 widget cards with scoped data
- [ ] Failed stat includes `// TODO` comment noting deferred resend interaction
- [ ] Loading and error states work
- [ ] No lint errors
- [ ] Changes committed to `plan/dashboard-widgets/phase-2/task-02-frontend-dashboard`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- No parallel tasks in Phase 2.
