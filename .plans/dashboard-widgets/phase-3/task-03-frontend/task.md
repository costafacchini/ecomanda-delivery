# Task: Frontend dashboard widgets + resend modal

**Plan**: Dashboard Widgets
**Phase**: 3
**Task ID (phase-local)**: task-03
**Task Path**: phase-3/task-03-frontend
**Depends On**: phase-2/task-02-backend
**JIRA**: N/A

## Objective

Replace the empty Dashboard stub with role-aware stat widgets. Super users get 5 widget sections including a clickable failed-messages card that opens a modal with per-message resend buttons. Licensee users get 3 scoped cards.

## Context

**Dashboard page**: `client/src/pages/Dashboard/index.js` — currently `<h1>Dashboard</h1>`.

**Service pattern**: `client/src/services/licensee.js` — `getToken()` → `api().get/post(url, { headers })`.

**API endpoints available after Phase 2:**
- `GET /resources/dashboard/stats` — returns `kind`-tagged payload (see `overview.md`)
- `POST /resources/messages/:id/resend` — re-queues a failed message; returns updated message

**UI stack**: Bootstrap 5 + Bootswatch Flatly. No new library installs. Bootstrap cards, modals, and tables only.

---

## Widget Specs

### Super user layout

| Widget | Data | Notes |
|--------|------|-------|
| Licenciados | `licensees.total`, `licensees.active`, `licensees.by_kind` | 3 inline stats |
| Volume de Mensagens | `message_volume.per_day` (table), `message_volume.per_hour` (table), `peak_throughput`, `avg_transfer_rate` | Two small tables + 2 stats |
| Taxa de Entrega | `delivery_rate.sent_today` + `sent_pct`, `delivery_rate.failed_today` + `failed_pct` | Failed stat is **clickable** → opens modal |
| Fila | `queue.pending_messages`, `queue.avg_time_in_queue_seconds` | 2 stats |
| Conversas | `conversations.started_today`, `conversations.ended_today`, `conversations.avg_messages_per_conversation`, `conversations.avg_duration_seconds` | 4 stats |

### Failed messages modal

Triggered by clicking the failed count in the Delivery Rate card.

On open:
- Call `GET /resources/messages?sended=false&page=1&limit=50` (existing endpoint, filtered) to fetch failed messages
- Render a Bootstrap modal with a table: contact number | text preview | error | "Reenviar" button
- Each "Reenviar" button calls `POST /resources/messages/:id/resend`
- On success: remove the row from the table; update the failed count in the card
- On error: show an inline error on the row

### Licensee user layout

| Widget | Data |
|--------|------|
| Contatos | `contacts.total`, `contacts.in_chatbot` |
| Mensagens Hoje | `messages.sent_today`, `messages.failed_today` |
| Mensagens por Dia | `messages.per_day` table (7 days) |

---

## Before You Start

- [ ] Verify `phase-2/task-02-backend/status.md` shows `complete`
- [ ] `git switch main && git pull --rebase origin main`
- [ ] Create branch: `git switch -c plan/dashboard-widgets/phase-3/task-03-frontend`
- [ ] Read `client/src/services/licensee.js` — confirm service pattern
- [ ] Read `client/src/services/message.js` — confirm how messages are fetched (filters available)
- [ ] Read `client/src/pages/Reports/Billing/scenes/Index/index.js` — confirm page pattern
- [ ] Check `status.md` — must be `not-started`
- [ ] Mark `status.md` as `in-progress`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/services/dashboard.js` | create | `getDashboardStats()` |
| `client/src/services/message.js` | modify | Add `resendMessage(id)` function |
| `client/src/pages/Dashboard/index.js` | modify | Replace stub with widget layout |

### Do NOT Modify

- `src/app/**` — backend complete
- Any other client pages or services

## Implementation Steps

### Step 1: Dashboard service

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

### Step 2: Add resendMessage to message service

In `client/src/services/message.js`, add:
```js
function resendMessage(id) {
  const headers = { 'x-access-token': getToken() }
  return api().post(`resources/messages/${id}/resend`, { headers })
}
```

Export it alongside the existing exports.

### Step 3: Implement Dashboard page

State:
- `stats` (null) — from getDashboardStats
- `loading` (true)
- `error` (null)
- `failedMessages` ([]) — loaded lazily when modal opens
- `modalOpen` (false)
- `modalLoading` (false)

On mount: call `getDashboardStats()` → set `stats`, `loading: false`. On error set `error`.

Render based on `stats.kind`:
- `'super'` → super layout (5 sections)
- `'licensee'` → licensee layout (3 cards)

**Modal behaviour:**
- Clicking the failed stat sets `modalOpen: true` and triggers `getMessages({ sended: false, limit: 50 })` → `failedMessages`
- Each row has a "Reenviar" button that calls `resendMessage(id)`, then removes the row on success
- After a successful resend, decrement `stats.delivery_rate.failed_today` in local state

Keep all markup inline. Extract only a `<DayTable rows={[]} />` helper if the per-day table appears in more than one place.

### Step 4: Manual smoke

`yarn run dev`. Test as both user types. Confirm: correct widgets, failed modal opens, resend removes the row.

## Testing

- [ ] `npx jest` (full suite) passes
- [ ] `npx eslint .` reports no new errors
- [ ] Manual smoke: both layouts, modal open/close, resend flow

## Documentation / KB Updates

- [ ] No KB/doc updates required.

## Completion Criteria

- [ ] Super layout: 5 widget sections with real data
- [ ] Failed stat is clickable and opens modal with resend buttons
- [ ] Successful resend removes the row and decrements the failed count
- [ ] Licensee layout: 3 scoped widget cards
- [ ] Loading and error states work
- [ ] No lint errors
- [ ] Changes committed to `plan/dashboard-widgets/phase-3/task-03-frontend`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- No parallel tasks in Phase 3.
