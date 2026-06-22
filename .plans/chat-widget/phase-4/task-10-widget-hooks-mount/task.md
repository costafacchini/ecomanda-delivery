# Task: Widget Hooks + IIFE Mount Script

**Plan**: Chat Widget
**Phase**: 4
**Task ID (phase-local)**: task-10
**Task Path**: phase-4/task-10-widget-hooks-mount
**Depends On**: phase-4/task-09-widget-components
**JIRA**: N/A

## Objective

Implement the three hooks (`useWidgetSession`, `useWidgetMessages`, `useWidgetSend`) that connect the UI to the backend API, then write the `main.tsx` IIFE mount script that reads `data-licensee` from the `<script>` tag and renders the widget into a Shadow DOM host element.

## Context

**Hooks**:

`useWidgetSession(apiToken)` — manages session in localStorage
- On first render, checks `localStorage.getItem('ecomanda_session_<apiToken>')` for an existing token
- Exposes `createSession(name, email)` which POSTs to `/widget/:apiToken/session`, stores the result in localStorage
- Returns `{ session, createSession, loading }`

`useWidgetMessages(apiToken, session)` — polling loop
- `setInterval` every 5 seconds calling `GET /widget/:apiToken/messages?sessionToken=...&since=...`
- Tracks the latest `createdAt` to use as `since` on next poll
- Merges new messages into state (no duplicates — use `_id` as key)
- Returns `{ messages }`

`useWidgetSend(apiToken, session)` — send a message
- POSTs to `/widget/:apiToken/messages`
- After successful send, triggers an immediate poll (call poll function once)
- Returns `{ send, sending }`

**Base URL**: The widget bundle is served from the same origin as the ecomanda server. The script tag URL (`document.currentScript.src`) gives us the origin — extract it to build API URLs dynamically.

**Mount script** (`widget/src/main.tsx`):
1. Read `data-licensee` from the `<script>` tag via `document.currentScript`
2. Create a `div` host element and append to `document.body`
3. Attach a Shadow DOM root to it
4. Inject minimal CSS reset into shadow root
5. Render `<WidgetRoot>` (stateful wrapper around `App`) into the shadow root via `ReactDOM.createRoot`

**WidgetRoot** lives in `main.tsx` and holds all `useState` + the three hooks.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-4/task-09-widget-components` status is `complete`
- [ ] Verify backend widget endpoints are running (Phase 3 complete)
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `widget/src/main.tsx` | modify | Replace placeholder with IIFE mount |
| `widget/src/hooks/useWidgetSession.ts` | create | Session management + localStorage |
| `widget/src/hooks/useWidgetMessages.ts` | create | Polling hook |
| `widget/src/hooks/useWidgetSend.ts` | create | Send message hook |
| `widget/src/api.ts` | create | Thin fetch wrappers for 3 endpoints |

### Do NOT Modify

- `widget/src/components/` — owned by task-09 (do not refactor components here)
- `widget/src/App.tsx` — read-only in this task; only WidgetRoot (in main.tsx) holds state

## Implementation Steps

### Step 1: Create widget/src/api.ts

Encapsulates all HTTP calls. Accepts `baseUrl` (derived from script src):

```ts
export async function createSession(baseUrl: string, apiToken: string, name: string, email: string) { ... }
export async function sendMessage(baseUrl: string, apiToken: string, widgetSessionToken: string, text: string) { ... }
export async function fetchMessages(baseUrl: string, apiToken: string, widgetSessionToken: string, since?: string) { ... }
```

All functions use `fetch()` — no external HTTP library needed.

### Step 2: Create useWidgetSession

```ts
const SESSION_KEY = (token: string) => `ecomanda_session_${token}`
```

- Read from `localStorage` on init
- `createSession` calls `api.createSession`, stores JSON stringified result, updates state

### Step 3: Create useWidgetMessages

```ts
const POLL_INTERVAL_MS = 5000
```

- `useEffect` starts interval when `session` is not null
- Clears interval on unmount
- Tracks `lastSeenAt` ref (ISO string) — update after each poll with the max `createdAt` of returned messages
- Handles empty response gracefully

### Step 4: Create useWidgetSend

- Sets `sending` state while POST in-flight
- On success, returns from send call and lets polling pick up the new message (or triggers one immediate poll via a callback)

### Step 5: Write main.tsx

```tsx
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { useWidgetSession } from './hooks/useWidgetSession'
import { useWidgetMessages } from './hooks/useWidgetMessages'
import { useWidgetSend } from './hooks/useWidgetSend'
import { useState } from 'react'

// Resolve base URL from script tag src
const scriptEl = document.currentScript as HTMLScriptElement | null
const baseUrl = scriptEl ? new URL(scriptEl.src).origin : ''
const apiToken = scriptEl?.dataset.licensee ?? ''

function WidgetRoot() {
  const [isOpen, setIsOpen] = useState(false)
  const { session, createSession, loading: sessionLoading } = useWidgetSession(apiToken)
  const { messages } = useWidgetMessages(baseUrl, apiToken, session)
  const { send, sending } = useWidgetSend(baseUrl, apiToken, session)

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

// Mount into Shadow DOM to isolate from host page styles
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

Open a minimal HTML page that loads the built `widget.js` with a real `data-licensee` token. Verify:
- Floating button appears
- Clicking opens popup
- SessionForm submits and stores in localStorage
- Sending a message routes to the backend
- Polling shows replies after agent responds

## Testing

- [ ] `cd widget && yarn build` succeeds
- [ ] Manual smoke: widget loads on a test HTML page, form submits, message round-trip works
- [ ] `localStorage` key persists session across page reload

## Documentation / KB Updates

After this task completes, run `document-solution` to capture the IIFE Shadow DOM mount pattern and the widget API integration.

## Completion Criteria

- [ ] Three hooks implemented and connected to App via WidgetRoot
- [ ] IIFE mount reads `data-licensee` from script tag
- [ ] Shadow DOM isolates widget styles from host page
- [ ] `yarn build` succeeds
- [ ] Manual smoke test confirms end-to-end flow
- [ ] Status updated to `complete` in `status.md`
