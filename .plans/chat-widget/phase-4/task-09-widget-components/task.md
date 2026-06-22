# Task: Widget React UI Components

**Plan**: Chat Widget
**Phase**: 4
**Task ID (phase-local)**: task-09
**Task Path**: phase-4/task-09-widget-components
**Depends On**: phase-4/task-08-widget-skeleton
**JIRA**: N/A

## Objective

Build the five React components that form the widget UI: `FloatingButton`, `ChatPopup`, `SessionForm`, `MessageList`, and `MessageInput`. All components are purely presentational in this task — state and side-effects are wired in task-10.

## Context

The widget renders inside a Shadow DOM root (created in task-10) to isolate its CSS from the host page. Components must:
- Use inline styles or CSS-in-JS — no external class names from the host page
- Be accessible (keyboard navigable, ARIA labels)
- Support a simple Intercom-style aesthetic: floating round button bottom-right, a popup card above it

**Component tree**:
```
<App licenseeApiToken={string}>
  <FloatingButton onClick isOpen />
  {isOpen && (
    <ChatPopup>
      {!session && <SessionForm onSubmit />}
      {session && (
        <>
          <MessageList messages />
          <MessageInput onSend />
        </>
      )}
    </ChatPopup>
  )}
</App>
```

**Props**:

`FloatingButton`: `{ onClick: () => void; isOpen: boolean }`
`ChatPopup`: `{ children: ReactNode }`
`SessionForm`: `{ onSubmit: (name: string, email: string, phone?: string) => void; loading: boolean }`
`MessageList`: `{ messages: WidgetMessage[] }`
`MessageInput`: `{ onSend: (text: string) => void; disabled: boolean }`

**WidgetMessage type** (define in `widget/src/types.ts`):
```ts
export interface WidgetMessage {
  _id: string
  text: string
  senderName?: string | null
  destination: 'to-chat' | 'to-messenger'
  createdAt: string
}
```

A message is from the visitor when `destination === 'to-chat'`. It's an agent reply when `destination === 'to-messenger'`.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-4/task-08-widget-skeleton` status is `complete`
- [ ] Confirm `widget/dist/widget.js` builds successfully (run `cd widget && yarn build`)
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `widget/src/types.ts` | create | WidgetMessage interface |
| `widget/src/components/FloatingButton.tsx` | create | Chat toggle button |
| `widget/src/components/ChatPopup.tsx` | create | Popup container |
| `widget/src/components/SessionForm.tsx` | create | Name + email form |
| `widget/src/components/MessageList.tsx` | create | Scrollable messages |
| `widget/src/components/MessageInput.tsx` | create | Text input + send |
| `widget/src/App.tsx` | create | Root component (props only, no state yet) |

### Do NOT Modify

- `widget/src/main.tsx` — owned by task-10 (mount script)

## Implementation Steps

### Step 1: Create types.ts

```ts
export interface WidgetMessage {
  _id: string
  text: string
  senderName?: string | null
  destination: 'to-chat' | 'to-messenger'
  createdAt: string
}

export interface WidgetSession {
  widgetSessionToken: string
  contactId: string
  licenseeId: string
}
```

### Step 2: FloatingButton

```tsx
const BUTTON_STYLE: React.CSSProperties = {
  position: 'fixed',
  bottom: 24,
  right: 24,
  width: 56,
  height: 56,
  borderRadius: '50%',
  background: '#0070f3',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
}
```

Show a chat bubble SVG icon when closed, an X when open. Use inline SVG.

### Step 3: ChatPopup

Fixed-position card, 360×500px, bottom-right above the button. Use inline styles. Render `children` inside.

### Step 4: SessionForm

Three inputs: name (required), email (required), phone (optional, labeled "Telefone (opcional)") + a submit button. Show a loading spinner while `loading` is true. Validate email format client-side before calling `onSubmit`. Pass `phone` as `undefined` (not empty string) when the field is blank.

### Step 5: MessageList

Scrollable `div` with `overflow-y: auto`. Map `messages` to message bubbles — visitor messages right-aligned (light blue), agent replies left-aligned (white). Auto-scroll to bottom when messages change (use `useEffect` + `useRef` on the container).

### Step 6: MessageInput

`textarea` (resizable 1–3 rows) + a send button. `onSend` called on button click or Enter key (Shift+Enter for newline). Clears input after send.

### Step 7: App.tsx

```tsx
import { FloatingButton } from './components/FloatingButton'
import { ChatPopup } from './components/ChatPopup'
import { SessionForm } from './components/SessionForm'
import { MessageList } from './components/MessageList'
import { MessageInput } from './components/MessageInput'
import type { WidgetMessage, WidgetSession } from './types'

interface AppProps {
  licenseeApiToken: string
  isOpen: boolean
  onToggle: () => void
  session: WidgetSession | null
  onSessionCreate: (name: string, email: string, phone?: string) => void
  messages: WidgetMessage[]
  onSend: (text: string) => void
  sessionLoading: boolean
  sendDisabled: boolean
}

export function App({ isOpen, onToggle, session, onSessionCreate, messages, onSend, sessionLoading, sendDisabled }: AppProps) {
  return (
    <>
      <FloatingButton onClick={onToggle} isOpen={isOpen} />
      {isOpen && (
        <ChatPopup>
          {!session
            ? <SessionForm onSubmit={onSessionCreate} loading={sessionLoading} />
            : (
              <>
                <MessageList messages={messages} />
                <MessageInput onSend={onSend} disabled={sendDisabled} />
              </>
            )
          }
        </ChatPopup>
      )}
    </>
  )
}
```

### Step 8: Verify build

```bash
cd widget && yarn build
```

Confirm it compiles without TypeScript errors.

## Testing

- [ ] `cd widget && yarn build` succeeds with no TS errors
- [ ] Visually inspect by opening `widget/dist/widget.js` as a script in a minimal HTML page

## Documentation / KB Updates

No KB/doc updates required.

## Completion Criteria

- [ ] All 5 components + App.tsx created
- [ ] `yarn build` in widget/ succeeds
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-10 owns `widget/src/main.tsx` and will complete App state wiring — do not add state to App.tsx in this task.
