# Task: Chat page UI + Nova conversa + routing + navbar

**Plan**: Local Chat UI
**Phase**: 2
**Task ID (phase-local)**: task-03
**Task Path**: phase-2/task-03-chat-page
**Depends On**: phase-1/task-01-rooms-api, phase-1/task-02-localchat-sector
**JIRA**: N/A

## Objective

Build the full-screen `/chat` page (room list + conversation panel), the "Nova conversa" flow for agent-initiated conversations (contact search → create room → auto-select), wire it into the React router, and add a conditional "Chat" link to the navbar.

## Context

**Whatsapp-web-clone reference** (`/Users/alan/Developer/pessoal/whatsapp-web-clone/src`):
- `pages/Chat/index.jsx` — top-level layout (sidebar + main panel)
- `pages/Chat/components/ChatInput.jsx` — message input bar
- `pages/Chat/components/Convo.jsx` — scrollable message list
- `pages/Chat/components/Header.jsx` — conversation header
- `components/Sidebar/index.jsx` — contact list sidebar
- `components/Sidebar/Contact.jsx` — single list item
- CSS in `pages/Chat/styles/main.css` and `components/Sidebar/styles/main.css`

**Existing ecomanda patterns:**
- Pages: `client/src/pages/{PageName}/index.tsx`; sub-components in `components/`
- Services: `client/src/services/{noun}.ts` using `api()` from `../services/api`
- `AppContext` provides `currentUser` + `activeLicensee`; effective licensee = `activeLicensee ?? currentUser?.licensee`
- Existing reusable component: `client/src/components/SelectContactsWithFilter/index.tsx` — use for the Nova conversa contact search
- `PrivateRoute` wraps children in `BaseLayout`; add `noLayout` prop to skip that for the full-screen route

**API endpoints from task-01:**
- `GET /resources/rooms?page=1` → `{ rooms: [...], hasMore }`
- `POST /resources/rooms` body `{ contactId }` → `{ room }` (or existing open room)
- `GET /resources/rooms/:roomId/messages?page=1` → `{ messages, total, page, hasMore }`
- `POST /v1/chat/rooms/:roomId/messages` body `{ text }` → send agent reply (already exists)

**Navbar condition:** `effectiveLicensee?.chatDefault === 'local'`

The Navbar already has `useContext(AppContext)` pulling `resetLicenseeModal` — extend to also pull `activeLicensee`.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-1/task-01-rooms-api/status.md` shows `complete`
- [ ] Verify `phase-1/task-02-localchat-sector/status.md` shows `complete`
- [ ] Read `client/src/pages/PrivateRoute/index.tsx`
- [ ] Read `client/src/pages/Navbar/index.tsx`
- [ ] Read `client/src/pages/routes.tsx`
- [ ] Read `client/src/components/SelectContactsWithFilter/index.tsx` — understand its `onChange` prop
- [ ] Skim `/Users/alan/Developer/pessoal/whatsapp-web-clone/src/pages/Chat/` — identify components to adapt
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/PrivateRoute/index.tsx` | modify | Add `noLayout` prop |
| `client/src/pages/routes.tsx` | modify | Add `/chat` route |
| `client/src/pages/Navbar/index.tsx` | modify | Add conditional Chat link |
| `client/src/pages/Chat/index.tsx` | create | Full-screen page entry, state management |
| `client/src/pages/Chat/components/RoomList.tsx` | create | Left sidebar room list |
| `client/src/pages/Chat/components/RoomList.spec.tsx` | create | RoomList unit tests |
| `client/src/pages/Chat/components/RoomItem.tsx` | create | Single room list entry |
| `client/src/pages/Chat/components/RoomItem.spec.tsx` | create | RoomItem unit tests |
| `client/src/pages/Chat/components/ConversationPanel.tsx` | create | Right panel: messages + input |
| `client/src/pages/Chat/components/ConversationPanel.spec.tsx` | create | ConversationPanel unit tests |
| `client/src/pages/Chat/components/MessageInput.tsx` | create | Text input + send button |
| `client/src/pages/Chat/components/MessageInput.spec.tsx` | create | MessageInput unit tests |
| `client/src/pages/Chat/components/NewConversationModal.tsx` | create | Contact search + POST /rooms |
| `client/src/pages/Chat/components/NewConversationModal.spec.tsx` | create | Modal unit tests |
| `client/src/pages/Chat/index.spec.tsx` | create | Integration smoke tests |
| `client/src/pages/Chat/styles.module.scss` | create | Scoped chat styles |
| `client/src/services/rooms.ts` | create | getRooms, createRoom, getRoomMessages, sendMessage |
| `client/src/pages/Navbar/index.spec.tsx` | modify | Chat link visibility tests |

### Do NOT Modify

- `client/src/contexts/App/index.tsx` — no changes needed
- `client/src/pages/BaseLayout/index.tsx` — unchanged
- `client/src/components/SelectContactsWithFilter/index.tsx` — reused as-is

## Implementation Steps

### Step 1: Add `noLayout` prop to `PrivateRoute`

```tsx
export default function PrivateRoute({ children, redirectTo, noLayout }: any) {
  if (!isAuthenticated()) return <Navigate to={redirectTo} />
  if (noLayout) return children
  return <BaseLayout>{children}</BaseLayout>
}
```

### Step 2: Create `client/src/services/rooms.ts`

Match the `api()` import pattern from an existing service (e.g., `client/src/services/message.ts`).

```ts
export function getRooms(params: { page?: number; licensee?: string } = {}) {
  return api().get('/resources/rooms', { params })
}

export function createRoom(contactId: string) {
  return api().post('/resources/rooms', { contactId })
}

export function getRoomMessages(roomId: string, params: { page?: number } = {}) {
  return api().get(`/resources/rooms/${roomId}/messages`, { params })
}

export function sendRoomMessage(roomId: string, text: string) {
  return api().post(`/v1/chat/rooms/${roomId}/messages`, { text })
}
```

### Step 3: Build components

**`styles.module.scss`** — scope all chat styles inside `.chatLayout`. Use the Bootswatch Flatly palette (primary #2C3E50, accent #18BC9C). Core layout:
```scss
.chatLayout { display: flex; height: 100vh; overflow: hidden; }
.sidebar { width: 30%; min-width: 280px; border-right: 1px solid #dee2e6; display: flex; flex-direction: column; overflow-y: auto; }
.conversation { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.messageList { flex: 1; overflow-y: auto; padding: 1rem; }
.messageFooter { padding: 0.5rem 1rem; border-top: 1px solid #dee2e6; }
```

**`RoomItem.tsx`** — props: `room`, `isSelected`, `onClick`, `unreadCount`. Adapted from `Sidebar/Contact.jsx`. Renders contact name, number, last message preview, timestamp, and unread badge (`badge bg-success rounded-pill`) when `unreadCount > 0`.

**`RoomList.tsx`** — props: `rooms`, `selectedRoomId`, `onSelect`, `onNewConversation`. Renders list of `RoomItem`. "Nenhuma conversa." empty state. "+" button at the top calling `onNewConversation`.

**`MessageInput.tsx`** — props: `onSend: (text: string) => void`, `disabled`. Controlled input + "Enviar" button. Clears on submit. Blocks submit on empty input. Adapted from `ChatInput.jsx`.

**`ConversationPanel.tsx`** — props: `room`, `messages`, `onSend`. Renders:
- Header: contact name + status badge (`pending` / `open`)
- Scrollable message list (`fromMe` → right-aligned, inbound → left-aligned)
- `MessageInput` at the bottom
- "Selecione uma conversa." empty state when `room` is null
- Auto-scrolls to latest message when `messages` updates

**`NewConversationModal.tsx`** — props: `show`, `onClose`, `onRoomCreated(room)`. Renders a Bootstrap modal:
- Uses `SelectContactsWithFilter` for contact search (pass `licensee` from `AppContext`)
- On contact selection, calls `createRoom(contactId)` from the rooms service
- On success: calls `onRoomCreated(room)` then closes
- Shows error toast on failure

**`index.tsx`** — full-screen page:
```tsx
export default function ChatPage() {
  const { currentUser, activeLicensee } = useContext(AppContext)
  const effectiveLicensee = activeLicensee ?? currentUser?.licensee
  const effectiveLicenseeId = (effectiveLicensee?._id ?? effectiveLicensee)?.toString()

  const [rooms, setRooms] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [showNewConvo, setShowNewConvo] = useState(false)

  // Load rooms on mount / licensee change
  useEffect(() => { /* call getRooms, setRooms */ }, [effectiveLicenseeId])

  // Load messages when room changes
  useEffect(() => { /* call getRoomMessages, setMessages */ }, [selectedRoom])

  function handleRoomSelect(room: any) {
    setSelectedRoom({ ...room, unreadCount: 0 })
    setRooms(prev => prev.map(r => r._id === room._id ? { ...r, unreadCount: 0 } : r))
  }

  async function handleSend(text: string) { /* sendRoomMessage, append to messages */ }

  function handleRoomCreated(room: any) {
    setRooms(prev => [room, ...prev.filter(r => r._id !== room._id)])
    handleRoomSelect(room)
    setShowNewConvo(false)
  }

  return (
    <div className={styles.chatLayout}>
      <RoomList
        rooms={rooms}
        selectedRoomId={selectedRoom?._id}
        onSelect={handleRoomSelect}
        onNewConversation={() => setShowNewConvo(true)}
      />
      <ConversationPanel room={selectedRoom} messages={messages} onSend={handleSend} />
      <NewConversationModal
        show={showNewConvo}
        onClose={() => setShowNewConvo(false)}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  )
}
```

### Step 4: Register the `/chat` route

In `client/src/pages/routes.tsx`:
```tsx
import ChatPage from './Chat'

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
1. Extend `useContext(AppContext)` to include `activeLicensee`
2. `const effectiveLicensee = activeLicensee ?? currentUser?.licensee`
3. After the "Mensagens" link:
```tsx
{effectiveLicensee?.chatDefault === 'local' && (
  <li className='nav-item'>
    <a className='nav-link' href='/#/chat'>Chat</a>
  </li>
)}
```

### Step 6: Write tests

**`RoomItem.spec.tsx`**:
- Renders contact name and number
- Renders last message text and timestamp when present
- Renders unread badge when `unreadCount > 0`; badge hidden when 0
- Calls `onClick` when clicked

**`RoomList.spec.tsx`**:
- Renders all room items
- Shows "Nenhuma conversa." when `rooms` is empty
- Passes `isSelected=true` only to the selected room
- "+" button calls `onNewConversation`

**`MessageInput.spec.tsx`**:
- Calls `onSend` with input value on button click
- Clears input after send
- Send button disabled when `disabled` prop is true
- Does NOT call `onSend` on empty input

**`ConversationPanel.spec.tsx`**:
- Shows "Selecione uma conversa." when `room` is null
- Renders contact name in header when room is provided
- `fromMe` messages are present in the DOM
- Inbound messages are present in the DOM
- Delegates send to `onSend` callback

**`NewConversationModal.spec.tsx`**:
- Modal is not visible when `show` is false
- Modal is visible when `show` is true
- Calls `createRoom` when a contact is selected
- Calls `onRoomCreated` with the returned room on success
- Calls `onClose` after successful room creation
- Shows an error when `createRoom` rejects

**`Chat/index.spec.tsx`** — mock `client/src/services/rooms.ts` with `vi.mock`:
- Calls `getRooms` on mount
- Renders rooms returned by `getRooms`
- Clicking a room calls `getRoomMessages` with that roomId
- Messages from `getRoomMessages` render in the conversation panel
- Submitting the input calls `sendRoomMessage` with roomId + text
- `handleRoomCreated` prepends the new room and auto-selects it

**`Navbar/index.spec.tsx`** — add:
- "Chat" link NOT rendered when `chatDefault` is not `'local'`
- "Chat" link IS rendered when `effectiveLicensee.chatDefault === 'local'`
- "Chat" link href is `/#/chat`

## Testing

- [ ] `RoomItem.spec.tsx` — renders, unread badge, click handler
- [ ] `RoomList.spec.tsx` — renders, empty state, selected state, new conversation button
- [ ] `MessageInput.spec.tsx` — send, clear, disabled, empty-input guard
- [ ] `ConversationPanel.spec.tsx` — empty state, header, message alignment, send delegation
- [ ] `NewConversationModal.spec.tsx` — visibility, createRoom call, onRoomCreated, onClose, error
- [ ] `Chat/index.spec.tsx` — getRooms on mount, room click, send, new room prepend
- [ ] `Navbar/index.spec.tsx` — Chat link shown/hidden, href correct
- [ ] `npx vitest run` inside `client/` — all existing tests still pass
- [ ] Manual: `yarn run dev` → navigate to `/#/chat`, verify full-screen layout, test Nova conversa flow

## Documentation / KB Updates

- [ ] No new KB doc required for this task.

## Completion Criteria

- [ ] `/chat` route renders full-screen chat layout when authenticated
- [ ] Navbar shows "Chat" link only when `effectiveLicensee.chatDefault === 'local'`
- [ ] Room list loads and displays open rooms with last message
- [ ] Selecting a room loads its message history
- [ ] Sending a message calls `POST /v1/chat/rooms/:roomId/messages`
- [ ] "Nova conversa" opens contact search, creates a room via `POST /resources/rooms`, auto-selects it
- [ ] All frontend tests pass
- [ ] Lint clean
- [ ] Status updated to `complete` in `status.md`
- [ ] Changes committed to `plan/local-chat-ui/phase-2/task-03-chat-page`

## Conflict Avoidance Notes

No sibling tasks in Phase 2.
