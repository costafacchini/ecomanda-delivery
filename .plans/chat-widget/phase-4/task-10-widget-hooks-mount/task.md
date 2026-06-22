# Task: Widget Hooks + IIFE Mount Script

**Plan**: Chat Widget
**Phase**: 4
**Task ID (phase-local)**: task-10
**Task Path**: phase-4/task-10-widget-hooks-mount
**Depends On**: phase-4/task-09-widget-components
**JIRA**: N/A

## Objective

Implement the three hooks (`useWidgetSession`, `useWidgetMessages`, `useWidgetSend`) that connect the UI to the backend API, then write the `main.tsx` IIFE mount script. The script mounts the widget into a Shadow DOM, exposes a global `window.EcomandaWidget.init()` API for authenticated (support) mode, and falls back to the SessionForm in anonymous (landing page) mode.

## Context

### Two operating modes

**Mode 1 — Anonymous (landing page)**
- No data provided at embed time
- Widget shows a SessionForm (name + email + optional phone) on first open
- Session stored in `localStorage` after form submission

**Mode 2 — Authenticated (support)**
- Host page calls `EcomandaWidget.init({ name, email, phone? })` after the user logs in
- Widget creates the session silently in the background
- Floating button is available; clicking opens the chat directly (no form)

### Global API: `window.EcomandaWidget`

The IIFE bundle sets `window.EcomandaWidget` **before** React mounts. The object starts with a pending-call buffer to handle the race between the `async` script loading and the host page calling `init()`:

```ts
window.EcomandaWidget = {
  init(data) {
    if (this._handler) {
      this._handler(data)   // React already mounted — call directly
    } else {
      this._pending = data  // buffer until React mounts
    }
  },
  _handler: null,
  _pending: null,
}
```

`WidgetRoot` registers `_handler` on mount and processes `_pending` if it exists.

### Hooks

`useWidgetSession(apiToken)` — session lifecycle
- On init: reads `localStorage.getItem('ecomanda_session_<apiToken>')` for existing token
- `createSession(name, email, phone?)` POSTs to `/widget/:apiToken/session`, stores result in localStorage
- Returns `{ session, createSession, loading }`

`useWidgetMessages(baseUrl, apiToken, session)` — polling
- `setInterval` every 5 s calling `GET /widget/:apiToken/messages?sessionToken=...&since=...`
- Tracks `lastSeenAt` ref — send as `since` on next poll for incremental updates
- Merges into state by `_id` (no duplicates)
- Starts only when `session` is non-null; clears interval on unmount
- Returns `{ messages }`

`useWidgetSend(baseUrl, apiToken, session)` — send
- POSTs to `/widget/:apiToken/messages`
- Exposes `triggerPoll` ref so it can immediately refresh after sending
- Returns `{ send, sending }`

**Base URL** is derived from `document.currentScript.src` — same origin as the ecomanda server.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-4/task-09-widget-components` status is `complete`
- [ ] Verify backend widget endpoints are running (Phase 3 complete)
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `widget/src/main.tsx` | modify | Replace placeholder; Shadow DOM mount + global API |
| `widget/src/hooks/useWidgetSession.ts` | create | Session management + localStorage |
| `widget/src/hooks/useWidgetMessages.ts` | create | Polling hook |
| `widget/src/hooks/useWidgetSend.ts` | create | Send message hook |
| `widget/src/api.ts` | create | Thin fetch wrappers for 3 endpoints |

### Do NOT Modify

- `widget/src/components/` — owned by task-09 (do not refactor components here)
- `widget/src/App.tsx` — read-only in this task; only WidgetRoot (in main.tsx) holds state

## Implementation Steps

### Step 1: Create widget/src/api.ts

Thin `fetch()` wrappers — no external HTTP library:

```ts
export async function createSession(
  baseUrl: string, apiToken: string,
  name: string, email: string, phone?: string,
) {
  const body: Record<string, string> = { name, email }
  if (phone) body.phone = phone
  const res = await fetch(`${baseUrl}/widget/${apiToken}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Session error ${res.status}`)
  return res.json()
}

export async function sendMessage(
  baseUrl: string, apiToken: string,
  widgetSessionToken: string, text: string,
) {
  const res = await fetch(`${baseUrl}/widget/${apiToken}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ widgetSessionToken, text }),
  })
  if (!res.ok) throw new Error(`Send error ${res.status}`)
  return res.json()
}

export async function fetchMessages(
  baseUrl: string, apiToken: string,
  widgetSessionToken: string, since?: string,
) {
  const params = new URLSearchParams({ sessionToken: widgetSessionToken })
  if (since) params.set('since', since)
  const res = await fetch(`${baseUrl}/widget/${apiToken}/messages?${params}`)
  if (!res.ok) throw new Error(`Fetch error ${res.status}`)
  return res.json() as Promise<{ messages: any[] }>
}
```

### Step 2: Create useWidgetSession

```ts
const SESSION_KEY = (token: string) => `ecomanda_session_${token}`
```

- Read from `localStorage` on init (parse JSON, fall back to `null`)
- `createSession(name, email, phone?)` calls `api.createSession`, stores result as JSON string, updates state
- Returns `{ session, createSession, loading }`

### Step 3: Create useWidgetMessages

```ts
const POLL_INTERVAL_MS = 5000
```

- `useEffect` with `session` dependency — starts interval only when `session !== null`
- `lastSeenAt` via `useRef<string | undefined>` — updated to max `createdAt` after each poll
- Merges new messages into state: `prev => [...prev, ...newOnes]` after deduplication by `_id`
- Cleanup: `clearInterval` on unmount / session change

### Step 4: Create useWidgetSend

- `sending` boolean state
- `pollNow` ref (a function set by `useWidgetMessages` via a shared ref) — call after successful send for immediate refresh
- Returns `{ send, sending }`

### Step 5: Write main.tsx

```tsx
import ReactDOM from 'react-dom/client'
import { useState, useEffect } from 'react'
import { App } from './App'
import { useWidgetSession } from './hooks/useWidgetSession'
import { useWidgetMessages } from './hooks/useWidgetMessages'
import { useWidgetSend } from './hooks/useWidgetSend'
import type { WidgetSession } from './types'

// Capture script context before async rendering
const scriptEl = document.currentScript as HTMLScriptElement | null
const baseUrl = scriptEl ? new URL(scriptEl.src).origin : ''
const apiToken = scriptEl?.dataset.licensee ?? ''

// Expose global API surface with pending-call buffer
type InitData = { name: string; email: string; phone?: string }
interface EcomandaWidgetAPI {
  init: (data: InitData) => void
  _handler: ((data: InitData) => void) | null
  _pending: InitData | null
}

;(window as any).EcomandaWidget = {
  init(data: InitData) {
    if (this._handler) {
      this._handler(data)
    } else {
      this._pending = data
    }
  },
  _handler: null,
  _pending: null,
} as EcomandaWidgetAPI

function WidgetRoot() {
  const [isOpen, setIsOpen] = useState(false)
  const { session, createSession, loading: sessionLoading } = useWidgetSession(apiToken)
  const { messages } = useWidgetMessages(baseUrl, apiToken, session)
  const { send, sending } = useWidgetSend(baseUrl, apiToken, session)

  // Register init handler and process any buffered call
  useEffect(() => {
    const api = (window as any).EcomandaWidget as EcomandaWidgetAPI
    api._handler = ({ name, email, phone }) => {
      createSession(name, email, phone)
    }
    if (api._pending) {
      const { name, email, phone } = api._pending
      api._pending = null
      createSession(name, email, phone)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <App
      licenseeApiToken={apiToken}
      isOpen={isOpen}
      onToggle={() => setIsOpen(o => !o)}
      session={session}
      onSessionCreate={createSession}
      messages={messages}
      onSend={send}
      sessionLoading={sessionLoading}
      sendDisabled={sending}
    />
  )
}

// Mount into Shadow DOM to isolate widget styles from host page
const host = document.createElement('div')
host.id = 'ecomanda-widget-host'
document.body.appendChild(host)
const shadow = host.attachShadow({ mode: 'open' })
const mountPoint = document.createElement('div')
shadow.appendChild(mountPoint)

ReactDOM.createRoot(mountPoint).render(<WidgetRoot />)
```

### Step 6: Build and smoke test

```bash
cd widget && yarn build
```

**Mode 1 test** — anonymous, open a minimal HTML page:
```html
<script src="http://localhost:5001/widget.js" data-licensee="YOUR_TOKEN" async></script>
```
- Floating button appears → click → SessionForm shown → submit → chat opens

**Mode 2 test** — authenticated, same page with extra script:
```html
<script src="http://localhost:5001/widget.js" data-licensee="YOUR_TOKEN" async></script>
<script>
  // Simulates calling init() after login — may run before or after widget script
  setTimeout(() => {
    EcomandaWidget.init({ name: 'Test User', email: 'test@example.com' })
  }, 500)
</script>
```
- Floating button appears → click → **no form**, chat opens directly

**Buffered init test** — call `EcomandaWidget.init()` synchronously before async script finishes:
```html
<script>
  window.EcomandaWidget = window.EcomandaWidget || { _pending: null, _handler: null }
  window.EcomandaWidget.init = function(d) { this._pending = d }
  EcomandaWidget.init({ name: 'Early User', email: 'early@example.com' })
</script>
<script src="http://localhost:5001/widget.js" data-licensee="YOUR_TOKEN" async></script>
```
- Widget mounts and processes the buffered call — form still skipped

## Testing

- [ ] `cd widget && yarn build` succeeds with no TS errors
- [ ] Mode 1 smoke: form shown for anonymous visitor, session stored in localStorage
- [ ] Mode 2 smoke: `init()` called after script load skips form, session created silently
- [ ] Buffered smoke: `init()` called before script load still works after mount
- [ ] `localStorage` key persists session across page reload (both modes)
- [ ] Polling picks up agent reply within 10s

## Documentation / KB Updates

After this task completes, run `document-solution` to create `docs/kb/features/chat-widget.md` covering:
- Two modes (anonymous vs authenticated)
- `EcomandaWidget.init()` API and buffering pattern
- IIFE Shadow DOM mount
- Backend API endpoints
- Web contact guard

## Completion Criteria

- [ ] Three hooks implemented and connected to App via WidgetRoot
- [ ] `window.EcomandaWidget.init()` works in both call-order scenarios (before and after mount)
- [ ] IIFE mount reads `data-licensee` from script tag
- [ ] Shadow DOM isolates widget styles from host page
- [ ] `yarn build` succeeds
- [ ] All three smoke tests pass
- [ ] Status updated to `complete` in `status.md`
