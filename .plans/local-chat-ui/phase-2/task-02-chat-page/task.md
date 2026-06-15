# Task: Chat page UI + routing + navbar

**Plan**: Local Chat UI
**Phase**: 2
**Task ID (phase-local)**: task-02
**Task Path**: phase-2/task-02-chat-page
**Depends On**: phase-1/task-01-rooms-api
**JIRA**: N/A

## Objective

Build the full-screen `/chat` page with a room list sidebar and conversation panel (adapted from whatsapp-web-clone), wire it into the React router, and add a conditional "Chat" link to the navbar.

## Context

**Whatsapp-web-clone reference** (`/Users/alan/Developer/pessoal/whatsapp-web-clone/src`):
- `pages/Chat/index.jsx` — top-level chat layout (sidebar + main panel)
- `pages/Chat/components/ChatInput.jsx` — message input bar
- `pages/Chat/components/Convo.jsx` — message list (scrollable)
- `pages/Chat/components/Header.jsx` — conversation header
- `components/Sidebar/index.jsx` — contact list sidebar
- `components/Sidebar/Contact.jsx` — single contact/room item
- CSS in `pages/Chat/styles/main.css` and `components/Sidebar/styles/main.css`

**Existing ecomanda patterns:**
- Pages live at `client/src/pages/{PageName}/index.tsx`; sub-components at `client/src/pages/{PageName}/components/`
- Services live at `client/src/services/{noun}.ts` and use `api()` from `../services/api`
- `AppContext` provides `currentUser` + `activeLicensee`; effective licensee = `activeLicensee ?? currentUser?.licensee`
- `PrivateRoute` (`client/src/pages/PrivateRoute/index.tsx`) currently always wraps children in `BaseLayout`. Add a `noLayout` prop (default `false`) that skips `BaseLayout` wrapping for the full-screen chat route.
- `client/src/pages/Navbar/index.tsx` already imports `AppContext`; extend to read `activeLicensee` and show the Chat link when `effectiveLicensee?.chatDefault === 'local'`

**API endpoints available after task-01:**
- `GET /resources/rooms?page=1` — `{ rooms: [...], hasMore: bool }`
- `GET /resources/rooms/:roomId/messages?page=1` — `{ messages: [...], total, page, hasMore }`
- `POST /v1/chat/rooms/:roomId/messages` body `{ text }` — send agent reply

**Auth headers:** all requests use `x-access-token` header (see `client/src/services/api.ts` for the axios instance).

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-1/task-01-rooms-api/status.md` shows `complete`
- [ ] Read `client/src/pages/PrivateRoute/index.tsx` — current implementation
- [ ] Read `client/src/pages/Navbar/index.tsx` — current navbar structure
- [ ] Read `client/src/pages/routes.tsx` — current route list
- [ ] Skim `/Users/alan/Developer/pessoal/whatsapp-web-clone/src/pages/Chat/` — identify which components to adapt
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/PrivateRoute/index.tsx` | modify | Add `noLayout` prop |
| `client/src/pages/routes.tsx` | modify | Add `/chat` route |
| `client/src/pages/Navbar/index.tsx` | modify | Add conditional Chat link |
| `client/src/pages/Chat/index.tsx` | create | Full-screen page entry |
| `client/src/pages/Chat/components/RoomList.tsx` | create | Left sidebar room list |
| `client/src/pages/Chat/components/RoomItem.tsx` | create | Single room list entry |
| `client/src/pages/Chat/components/ConversationPanel.tsx` | create | Right panel: messages + input |
| `client/src/pages/Chat/components/MessageInput.tsx` | create | Text input + send button |
| `client/src/pages/Chat/styles.module.scss` | create | Scoped chat styles |
| `client/src/services/rooms.ts` | create | API calls for rooms + messages |
| `client/src/pages/Chat/index.spec.tsx` | create | Smoke tests |
| `client/src/pages/Navbar/index.spec.tsx` | modify | Add Chat link visibility tests |

### Do NOT Modify

- `client/src/contexts/App/index.tsx` — no changes needed; read AppContext via hook
- `client/src/pages/BaseLayout/index.tsx` — unchanged

## Implementation Steps

### Step 1: Add `noLayout` prop to `PrivateRoute`

```tsx
export default function PrivateRoute({ children, redirectTo, noLayout }: any) {
  if (!isAuthenticated()) return <Navigate to={redirectTo} />
  if (noLayout) return children
  return <BaseLayout>{children}</BaseLayout>
}
```

This is additive only — no existing callers change.

### Step 2: Create `client/src/services/rooms.ts`

```ts
import { api } from './api'  // adjust import to match existing auth/api pattern

export function getRooms(params: { page?: number; licensee?: string } = {}) {
  return api().get('/resources/rooms', { params })
}

export function getRoomMessages(roomId: string, params: { page?: number } = {}) {
  return api().get(`/resources/rooms/${roomId}/messages`, { params })
}

export function sendRoomMessage(roomId: string, text: string) {
  return api().post(`/v1/chat/rooms/${roomId}/messages`, { text })
}
```

Check `client/src/services/message.ts` or another existing service to match the `api()` import pattern exactly.

### Step 3: Build `client/src/pages/Chat/` components

**`styles.module.scss`** — all chat styles scoped here. Adapt colors from whatsapp-web-clone's `tokens.css` but use the Bootswatch Flatly palette where possible (primary #2C3E50, accent #18BC9C). Key layout:
```scss
.chatLayout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.sidebar {
  width: 30%;
  min-width: 280px;
  border-right: 1px solid #dee2e6;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.conversation {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.messageList {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}
.messageFooter {
  padding: 0.5rem 1rem;
  border-top: 1px solid #dee2e6;
}
```

**`RoomItem.tsx`** — props: `room`, `isSelected`, `onClick`. Renders contact name, number, last message preview, and timestamp. Adapted from `Sidebar/Contact.jsx`.

**`RoomList.tsx`** — props: `rooms`, `selectedRoomId`, `onSelect`. Renders a list of `RoomItem`. Shows "Nenhuma conversa." when empty.

**`MessageInput.tsx`** — props: `onSend: (text: string) => void`, `disabled`. Controlled text input + "Enviar" button. Clears on submit. Adapted from `ChatInput.jsx`.

**`ConversationPanel.tsx`** — props: `room`, `messages`, `onSend`. Renders:
- Header: contact name + status badge
- Scrollable message list (align right = fromMe, align left = from contact)
- `MessageInput` at the bottom
- Empty state when no room selected

**`index.tsx`** — main page:
```tsx
export default function ChatPage() {
  const { currentUser, activeLicensee } = useContext(AppContext)
  const effectiveLicensee = activeLicensee ?? currentUser?.licensee
  
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messages, setMessages] = useState([])

  // Load rooms on mount
  useEffect(() => { ... }, [effectiveLicensee])

  // Load messages when room changes
  useEffect(() => { ... }, [selectedRoom])

  async function handleSend(text) { ... }

  return (
    <div className={styles.chatLayout}>
      <RoomList rooms={rooms} selectedRoomId={selectedRoom?._id} onSelect={handleRoomSelect} />
      <ConversationPanel room={selectedRoom} messages={messages} onSend={handleSend} />
    </div>
  )
}
```

### Step 4: Register the `/chat` route

In `client/src/pages/routes.tsx`, add after the `/messages` route:
```tsx
import ChatPage from './Chat'

// inside <Routes>:
<Route
  path='/chat'
  element={
    <PrivateRoute redirectTo='/signin' noLayout>
      <ChatPage />
    </PrivateRoute>
  }
/>
```

### Step 5: Add Navbar link

In `client/src/pages/Navbar/index.tsx`:

1. Extend the `useContext(AppContext)` destructure to include `activeLicensee`:
```tsx
const { resetLicenseeModal, activeLicensee } = useContext(AppContext)
```

2. Derive effective licensee at the top of the component:
```tsx
const effectiveLicensee = activeLicensee ?? currentUser?.licensee
```

3. Add Chat link after the "Mensagens" link:
```tsx
{effectiveLicensee?.chatDefault === 'local' && (
  <li className='nav-item'>
    <a className='nav-link' href='/#/chat'>Chat</a>
  </li>
)}
```

### Step 6: Write tests

**`client/src/pages/Chat/index.spec.tsx`** — smoke tests:
- Renders the room list sidebar
- Clicking a room item loads messages
- Submitting the input calls `sendRoomMessage`

Mock `client/src/services/rooms.ts` using `vi.mock`.

**`client/src/pages/Navbar/index.spec.tsx`** — add:
- "Chat" link NOT rendered when `chatDefault` is not `'local'`
- "Chat" link IS rendered when `effectiveLicensee.chatDefault === 'local'`

## Testing

- [ ] `npx vitest run` inside `client/` — all existing tests still pass
- [ ] New Chat page spec passes: rooms render, room selection triggers message fetch, send calls API
- [ ] Navbar spec covers: Chat link shown/hidden based on `chatDefault`
- [ ] Manual: run `yarn run dev` and navigate to `/#/chat` — full-screen layout renders correctly

## Documentation / KB Updates

- [ ] No new KB doc required — pattern follows existing page conventions. If the full-screen layout pattern is reused later, run `document-solution` then.

## Completion Criteria

- [ ] `/chat` route renders full-screen chat layout when authenticated
- [ ] Navbar shows "Chat" link only when `effectiveLicensee.chatDefault === 'local'`
- [ ] Room list loads from `GET /resources/rooms`
- [ ] Selecting a room loads messages from `GET /resources/rooms/:roomId/messages`
- [ ] Sending a message calls `POST /v1/chat/rooms/:roomId/messages`
- [ ] All frontend tests pass
- [ ] Lint clean
- [ ] Status updated to `complete` in `status.md`
- [ ] Changes committed to `plan/local-chat-ui/phase-2/task-02-chat-page`

## Conflict Avoidance Notes

No sibling tasks in Phase 2.
