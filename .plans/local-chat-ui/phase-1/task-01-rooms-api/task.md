# Task: Rooms API endpoints (sector-aware)

**Plan**: Local Chat UI
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-rooms-api
**Depends On**: None
**JIRA**: N/A

## Objective

Create three REST endpoints: `GET /resources/rooms` (sector-aware room listing), `POST /resources/rooms` (agent-initiated room creation), and `GET /resources/rooms/:roomId/messages` (paginated message history).

## Context

The `local-chat-infra` plan built the Room model, the LocalChat plugin, and the agent-reply endpoint (`POST /v1/chat/rooms/:roomId/messages`). The `setores-webhook-providers` plan added sector-scoped webhook routing — messages arriving via a sector's webhook already carry `message.sector`. The dashboard controller has a similar `openRooms` endpoint but it is super/admin-only; a dedicated resource controller is needed.

**Key existing files:**
- `src/app/models/Room.ts` — schema: `contact (ref Contact)`, `sector (ref Sector, nullable)`, `agent (ref User)`, `status (pending|open|closed)`, `closed (bool)`
- `src/app/models/Sector.ts` — schema: `licensee`, `users: [ObjectId ref User]`, `active`
- `src/app/repositories/room.ts` — `RoomRepositoryDatabase` with `findOpenForContact` and `findForAgent`
- `src/app/controllers/DashboardController.ts` — `openRooms()` for reference (super/admin only)
- `src/app/routes/resources-routes.ts` — composition root

**Auth pattern:**
```ts
// authenticate sets req.userId from JWT; authorize checks user.role
router.use(authenticate)
```

**Sector-scoped filtering logic:**
- Fetch sectors where `users` array contains `req.userId` → `agentSectorIds`
- If `agentSectorIds.length > 0`: filter rooms where `room.sector` is in `agentSectorIds`
- If `agentSectorIds.length === 0` (agent not in any sector, or admin/super): return all rooms for the licensee regardless of sector
- Super can pass `?licensee=` to filter by licensee

**Agent-initiated room creation (`POST /resources/rooms`):**
- If an open room already exists for the contact, return it (no duplicate)
- If only closed rooms exist, create a new one
- Validate that the contact belongs to the user's licensee (prevent cross-licensee room creation)

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify `status.md` shows `not-started`
- [ ] Read `src/app/controllers/DashboardController.ts` — `openRooms` and `closeRoom` for aggregation patterns
- [ ] Read `src/app/repositories/room.ts` — existing helpers
- [ ] Read `src/app/models/Sector.ts` — `users` array field
- [ ] Read `src/app/routes/resources-routes.ts` — composition root pattern
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/RoomsController.ts` | create | index, create, messages actions |
| `src/app/controllers/RoomsController.spec.ts` | create | Controller specs |
| `src/app/repositories/room.ts` | modify | Add `findForLicensee()` helper |
| `src/app/routes/resources-routes.ts` | modify | Wire 3 new routes |

### Do NOT Modify

- `src/app/controllers/DashboardController.ts` — read-only reference
- `src/app/models/Room.ts` — schema is stable; read-only
- `src/app/plugins/chats/LocalChat.ts` — owned by phase-1/task-02-localchat-sector

## Implementation Steps

### Step 1: Add `findForLicensee` to `RoomRepositoryDatabase`

In `src/app/repositories/room.ts`, add to `RoomRepositoryDatabase`:

```ts
async findForLicensee(
  licenseeId: any,
  { sectorIds = [], page = 1, limit = 20 }: { sectorIds?: any[]; page?: number; limit?: number } = {}
) {
  const contacts = await this.model().db.model('Contact').find({ licensee: licenseeId }).select('_id').lean()
  const contactIds = contacts.map((c: any) => c._id)

  const filter: any = { contact: { $in: contactIds }, closed: false }

  if (sectorIds.length > 0) {
    filter.sector = { $in: sectorIds }
  }

  return this.model()
    .find(filter)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit + 1)
    .populate('contact', 'name number')
    .lean()
}
```

When `sectorIds` is empty the sector filter is omitted — all open rooms for the licensee are returned (admin/super or agents not assigned to any sector).

### Step 2: Create `RoomsController`

Create `src/app/controllers/RoomsController.ts` with three actions:

**`index`** — `GET /resources/rooms`:
```ts
async index(req, res) {
  const user = await this.userRepository.findFirst({ _id: req.userId }, ['licensee'])
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' })

  const licenseeId = user.role === 'super'
    ? (req.query.licensee ?? null)
    : (user.licensee?._id ?? user.licensee)

  if (!licenseeId) return res.status(400).json({ message: 'Licenciado não identificado.' })

  // Resolve agent's sectors
  const agentSectors = await this.sectorRepository
    .model()
    .find({ users: req.userId, licensee: licenseeId, active: true })
    .select('_id')
    .lean()
  const sectorIds = agentSectors.map((s: any) => s._id)

  const page = Math.max(1, parseInt(req.query.page as string) || 1)
  const limit = 20

  const roomResults = await this.roomRepository.findForLicensee(licenseeId, { sectorIds, page, limit })
  const hasMore = roomResults.length > limit
  const rooms = hasMore ? roomResults.slice(0, limit) : roomResults

  // Attach last message
  const roomIds = rooms.map((r: any) => r._id)
  const lastMessages = await this.messageRepository.model().aggregate([
    { $match: { room: { $in: roomIds } } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$room', text: { $first: '$text' }, kind: { $first: '$kind' }, createdAt: { $first: '$createdAt' } } },
  ])
  const lastMsgMap: Record<string, any> = {}
  for (const m of lastMessages) lastMsgMap[m._id.toString()] = m
  const roomsWithLast = rooms.map((r: any) => ({ ...r, lastMessage: lastMsgMap[r._id.toString()] || null }))

  return res.status(200).json({ rooms: roomsWithLast, hasMore })
}
```

**`create`** — `POST /resources/rooms`:
```ts
async create(req, res) {
  const user = await this.userRepository.findFirst({ _id: req.userId }, ['licensee'])
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' })

  const licenseeId = (user.licensee?._id ?? user.licensee)?.toString()

  const contact = await this.contactRepository.findFirst({ _id: req.body.contactId })
  if (!contact) return res.status(404).json({ message: 'Contato não encontrado.' })
  if (contact.licensee?.toString() !== licenseeId && user.role !== 'super') {
    return res.status(403).json({ message: 'Acesso negado.' })
  }

  // Return existing open room if one exists
  const existing = await this.roomRepository.findOpenForContact(contact._id)
  if (existing) return res.status(200).json({ room: existing })

  const room = await this.roomRepository.create({
    contact: contact._id,
    status: 'pending',
  })
  return res.status(201).json({ room })
}
```

**`messages`** — `GET /resources/rooms/:roomId/messages`:
```ts
async messages(req, res) {
  const user = await this.userRepository.findFirst({ _id: req.userId }, ['licensee'])
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' })

  const room = await this.roomRepository.findFirst({ _id: req.params.roomId }, ['contact'])
  if (!room) return res.status(404).json({ message: 'Conversa não encontrada.' })

  const userLicenseeId = user.role === 'super' ? null : (user.licensee?._id ?? user.licensee)?.toString()
  const roomLicenseeId = room.contact?.licensee?.toString()
  if (userLicenseeId && roomLicenseeId && userLicenseeId !== roomLicenseeId) {
    return res.status(403).json({ message: 'Acesso negado.' })
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1)
  const limit = 30
  const total = await this.messageRepository.model().countDocuments({ room: room._id })
  const messages = await this.messageRepository.model()
    .find({ room: room._id })
    .sort({ createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  return res.status(200).json({ messages, total, page, hasMore: page * limit < total })
}
```

Constructor must inject `sectorRepository` and `contactRepository` in addition to user/room/message repos.

### Step 3: Wire routes in `resources-routes.ts`

1. Import `RoomsController`.
2. In the composition root: `const roomsController = new RoomsController({ userRepository, roomRepository, messageRepository, sectorRepository, contactRepository })`
3. Add routes:
```ts
router.get('/rooms', roomsController.index)
router.post('/rooms', roomsController.create)
router.get('/rooms/:roomId/messages', roomsController.messages)
```

### Step 4: Write `RoomsController.spec.ts`

Follow the pattern of existing controller specs (e.g., `DashboardController.spec.ts`). Use Memory repository variants.

**`index` tests:**
- Returns rooms for user's licensee (happy path)
- Returns only rooms in agent's sectors when agent belongs to sectors
- Returns all rooms when agent has no sectors (not sector-restricted)
- Super can filter by `?licensee=`
- Returns 400 when super provides no `?licensee=`
- Returns 404 for unknown user
- `hasMore: true` when > 20 rooms exist

**`create` tests:**
- Creates and returns a new room for a valid contact
- Returns the existing open room (HTTP 200) when one already exists for the contact
- Returns 404 when contact not found
- Returns 403 when contact belongs to a different licensee
- Returns 404 when user not found

**`messages` tests:**
- Returns paginated messages sorted by `createdAt asc` for a valid room
- Returns 403 when user's licensee doesn't match room's contact licensee
- Returns 404 when room not found
- `hasMore` reflects pagination correctly

## Testing

- [ ] `RoomsController.spec.ts` covers all cases listed above (12+ test cases)
- [ ] `findForLicensee` sector filtering is exercised via controller spec (agent with sectors vs. without)
- [ ] Existing backend tests still pass: `npx jest`
- [ ] `npx eslint .` produces no new errors

## Documentation / KB Updates

- [ ] No KB/doc updates required for this task — follows established controller pattern.

## Completion Criteria

- [ ] `GET /resources/rooms` returns sector-filtered rooms with last message
- [ ] `POST /resources/rooms` creates a room or returns existing open room; 403 on cross-licensee contact
- [ ] `GET /resources/rooms/:roomId/messages` returns paginated messages; 403 on cross-licensee room
- [ ] All new and existing backend tests pass
- [ ] Lint clean
- [ ] Status updated to `complete` in `status.md`
- [ ] Changes committed to `plan/local-chat-ui/phase-1/task-01-rooms-api`

## Conflict Avoidance Notes

Parallel task in Phase 1: `phase-1/task-02-localchat-sector` owns `src/app/plugins/chats/LocalChat.ts` — do not touch that file.
