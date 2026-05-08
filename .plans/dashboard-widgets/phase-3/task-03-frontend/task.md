# Task: Frontend — independent card components + resend modal

**Plan**: Dashboard Widgets
**Phase**: 3
**Task ID (phase-local)**: task-03
**Task Path**: phase-3/task-03-frontend
**Depends On**: phase-2/task-02-backend
**JIRA**: N/A

## Objective

Replace the empty Dashboard stub with role-aware card components. Each card is self-contained: it fires its own request on mount, manages its own loading and error state, and renders independently. Super users see 5 cards; licensee users see 3 cards.

## Context

**Dashboard page**: `client/src/pages/Dashboard/index.js` — currently `<h1>Dashboard</h1>`.

**User kind detection**: call `fetchLoggedUser()` (from `client/src/services/auth.js`) once in the Dashboard page on mount to determine `isSuper`. Pass it down as a prop to decide which card set to render. Do not duplicate this call inside each card.

**Service pattern**: `client/src/services/licensee.js` — `getToken()` → `api().get/post(url, { headers })`.

**UI stack**: Bootstrap 5 + Bootswatch Flatly. No new library installs. Each card is a Bootstrap `.card` inside a responsive grid.

**Available backend endpoints (from Phase 2):**

| Endpoint | Used by |
|----------|---------|
| `GET /resources/dashboard/licensees` | SuperLicenseesCard |
| `GET /resources/dashboard/message-volume` | SuperMessageVolumeCard |
| `GET /resources/dashboard/delivery-rate` | SuperDeliveryRateCard |
| `GET /resources/dashboard/queue` | SuperQueueCard |
| `GET /resources/dashboard/conversations` | SuperConversationsCard |
| `GET /resources/dashboard/contacts` | LicenseeContactsCard |
| `GET /resources/dashboard/messages-today` | LicenseeMessagesTodayCard |
| `GET /resources/dashboard/messages-per-day` | LicenseeMessagesPerDayCard |
| `GET /resources/messages?sended=false&limit=50` | FailedMessagesModal (lazy) |
| `POST /resources/messages/:id/resend` | FailedMessagesModal resend button |

---

## Card Component Pattern

Every card follows this structure (adapt naming per card):

```jsx
function SuperLicenseesCard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDashboardLicensees()
      .then(res => setData(res.data))
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="card"><div className="card-body">Carregando...</div></div>
  if (error)   return <div className="card"><div className="card-body text-danger">{error}</div></div>

  return (
    <div className="card">
      <div className="card-header">Licenciados</div>
      <div className="card-body">
        {/* render data */}
      </div>
    </div>
  )
}
```

Each card lives in its own file under `client/src/pages/Dashboard/cards/`.

---

## Card Specs

### Super cards

**`SuperLicenseesCard`** (`cards/SuperLicenseesCard.js`)
- `total` / `active` inline stats
- `by_kind`: demo / free / paid counts

**`SuperMessageVolumeCard`** (`cards/SuperMessageVolumeCard.js`)
- `peak_throughput` and `avg_transfer_rate` as stat numbers
- `per_day`: table with date | count (7 rows)
- `per_hour`: table with hour | count (up to 24 rows)

**`SuperDeliveryRateCard`** (`cards/SuperDeliveryRateCard.js`)
- Sent: `sent_today` (`sent_pct`%)
- Failed: `failed_today` (`failed_pct`%) — **clickable**, opens `FailedMessagesModal`

**`SuperQueueCard`** (`cards/SuperQueueCard.js`)
- `pending_messages`
- `avg_time_in_queue_seconds`

**`SuperConversationsCard`** (`cards/SuperConversationsCard.js`)
- `started_today`, `ended_today`
- `avg_messages_per_conversation`, `avg_duration_seconds`

### Licensee cards

**`LicenseeContactsCard`** (`cards/LicenseeContactsCard.js`)
- `total`, `in_chatbot`

**`LicenseeMessagesTodayCard`** (`cards/LicenseeMessagesTodayCard.js`)
- `sent_today`, `failed_today`, percentages

**`LicenseeMessagesPerDayCard`** (`cards/LicenseeMessagesPerDayCard.js`)
- `per_day` table (7 rows)

### `FailedMessagesModal` (`cards/FailedMessagesModal.js`)

Props: `{ isOpen, onClose, onResendSuccess }`

On open: calls `getMessages({ sended: false, limit: 50 })` → renders Bootstrap modal table:
- Columns: contact number | text preview | error | "Reenviar" button
- "Reenviar" calls `resendMessage(id)` → on success: removes row, calls `onResendSuccess()` (parent decrements count)
- On error: shows inline row error

---

## Dashboard Page

`client/src/pages/Dashboard/index.js`:

```jsx
export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    fetchLoggedUser()
      .then(setUser)
      .finally(() => setLoadingUser(false))
  }, [])

  if (loadingUser) return <p>Carregando...</p>

  if (user?.isSuper) {
    return (
      <div className="row g-3">
        <div className="col-12 col-md-6"><SuperLicenseesCard /></div>
        <div className="col-12 col-md-6"><SuperMessageVolumeCard /></div>
        <div className="col-12 col-md-6"><SuperDeliveryRateCard /></div>
        <div className="col-12 col-md-6"><SuperQueueCard /></div>
        <div className="col-12"><SuperConversationsCard /></div>
      </div>
    )
  }

  return (
    <div className="row g-3">
      <div className="col-12 col-md-4"><LicenseeContactsCard /></div>
      <div className="col-12 col-md-4"><LicenseeMessagesTodayCard /></div>
      <div className="col-12 col-md-4"><LicenseeMessagesPerDayCard /></div>
    </div>
  )
}
```

---

## Before You Start

- [ ] Verify `phase-2/task-02-backend/status.md` shows `complete`
- [ ] `git switch main && git pull --rebase origin main`
- [ ] Create branch: `git switch -c plan/dashboard-widgets/phase-3/task-03-frontend`
- [ ] Read `client/src/services/licensee.js` — confirm service pattern
- [ ] Read `client/src/services/auth.js` — confirm `fetchLoggedUser()` shape
- [ ] Read `client/src/services/message.js` — confirm `getMessages` query params
- [ ] Check `status.md` — must be `not-started`
- [ ] Mark `status.md` as `in-progress`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/services/dashboard.js` | create | 8 service functions |
| `client/src/services/message.js` | modify | Add `resendMessage(id)` |
| `client/src/pages/Dashboard/index.js` | modify | Orchestrate card layout by user kind |
| `client/src/pages/Dashboard/cards/SuperLicenseesCard.js` | create | |
| `client/src/pages/Dashboard/cards/SuperMessageVolumeCard.js` | create | |
| `client/src/pages/Dashboard/cards/SuperDeliveryRateCard.js` | create | |
| `client/src/pages/Dashboard/cards/SuperQueueCard.js` | create | |
| `client/src/pages/Dashboard/cards/SuperConversationsCard.js` | create | |
| `client/src/pages/Dashboard/cards/LicenseeContactsCard.js` | create | |
| `client/src/pages/Dashboard/cards/LicenseeMessagesTodayCard.js` | create | |
| `client/src/pages/Dashboard/cards/LicenseeMessagesPerDayCard.js` | create | |
| `client/src/pages/Dashboard/cards/FailedMessagesModal.js` | create | |

### Do NOT Modify

- `src/app/**` — backend complete

## Implementation Steps

### Step 1: Create dashboard service

`client/src/services/dashboard.js` — 8 functions, one per endpoint:
```js
import { getToken } from './auth'
import api from './api'

const headers = () => ({ 'x-access-token': getToken() })

export function getDashboardLicensees()    { return api().get('resources/dashboard/licensees',       { headers: headers() }) }
export function getDashboardMessageVolume(){ return api().get('resources/dashboard/message-volume',  { headers: headers() }) }
export function getDashboardDeliveryRate() { return api().get('resources/dashboard/delivery-rate',   { headers: headers() }) }
export function getDashboardQueue()        { return api().get('resources/dashboard/queue',            { headers: headers() }) }
export function getDashboardConversations(){ return api().get('resources/dashboard/conversations',    { headers: headers() }) }
export function getDashboardContacts()     { return api().get('resources/dashboard/contacts',         { headers: headers() }) }
export function getDashboardMessagesToday(){ return api().get('resources/dashboard/messages-today',   { headers: headers() }) }
export function getDashboardMessagesPerDay(){ return api().get('resources/dashboard/messages-per-day',{ headers: headers() }) }
```

### Step 2: Add resendMessage to message service

In `client/src/services/message.js`:
```js
function resendMessage(id) {
  const headers = { 'x-access-token': getToken() }
  return api().post(`resources/messages/${id}/resend`, { headers })
}
```

### Step 3: Create card components

One file per card following the pattern defined above. All live in `client/src/pages/Dashboard/cards/`.

### Step 4: Implement Dashboard page

Replace `index.js` stub with the orchestration component shown above.

### Step 5: Manual smoke

`yarn run dev`. Log in as super and licensee. Confirm: cards load independently (staggered if one is slow), failed modal opens, resend removes row.

## Testing

- [ ] `npx jest` (full suite) passes
- [ ] `npx eslint .` reports no new errors
- [ ] Manual smoke: both user kinds, independent card loading, resend modal

## Documentation / KB Updates

- [ ] No KB/doc updates required.

## Completion Criteria

- [ ] Super: 5 card components render independently with real data
- [ ] Licensee: 3 card components render independently with scoped data
- [ ] Each card shows its own loading/error state
- [ ] Failed stat opens modal; resend removes row and decrements count in parent card
- [ ] No lint errors
- [ ] Changes committed to `plan/dashboard-widgets/phase-3/task-03-frontend`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- No parallel tasks in Phase 3.
