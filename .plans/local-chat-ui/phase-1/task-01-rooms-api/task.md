# Task: Rooms API endpoints

**Plan**: Local Chat UI
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-rooms-api
**Depends On**: None
**JIRA**: N/A

## Objective

Create two REST endpoints that the frontend chat page will consume: `GET /resources/rooms` (list open rooms for the current user's licensee) and `GET /resources/rooms/:roomId/messages` (paginated message history for a room).

## Context

The `local-chat-infra` plan already built the Room model, the LocalChat plugin, and the agent-reply endpoint (`POST /v1/chat/rooms/:roomId/messages`). The dashboard controller has a similar `openRooms` endpoint but it is super/admin-only and unsuitable for agents — a dedicated resource controller is needed.

Key existing files:
- `src/app/models/Room.ts` — Room schema: `contact (ref Contact)`, `agent (ref User)`, `status (pending|open|closed)`, `closed (bool)`, `closedAt`
- `src/app/repositories/room.ts` — `RoomRepositoryDatabase` with `findOpenForContact` and `findForAgent`
- `src/app/controllers/DashboardController.ts` — `openRooms()` for reference (super/admin only)
- `src/app/routes/resources-routes.ts` — composition root; add routes here
- `src/types/index.ts` — shared interfaces; `IRoom`, `IContact` live here

Auth pattern (from `resources-routes.ts`):
```ts
function authenticate(req, res, next) { /* validates x-access-token JWT */ }
function authorize(...roles) { /* checks user.role */ }
router.use(authenticate)
```

The `req.userId` is set by `authenticate`. Use `userRepository.findFirst({ _id: req.userId })` to resolve the user; the user's `licensee` field is an ObjectId (not populated on this call).

Super users have no `licensee` on their User document; they can pass `?licensee=` as a query param to filter by licensee.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-1/task-01-rooms-api/status.md` shows `not-started`
- [ ] Read `src/app/controllers/DashboardController.ts` — `openRooms` method — for the aggregation pattern to fetch lastMessage per room
- [ ] Read `src/app/repositories/room.ts` for existing query helpers
- [ ] Read `src/app/routes/resources-routes.ts` to understand the composition root
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/RoomsController.ts` | create | New controller |
| `src/app/controllers/RoomsController.spec.ts` | create | Controller specs |
| `src/app/repositories/room.ts` | modify | Add `findForLicensee()` helper |
| `src/app/routes/resources-routes.ts` | modify | Wire routes + controller |

### Do NOT Modify

- `src/app/controllers/DashboardController.ts` — read-only reference
- `src/app/models/Room.ts` — schema is stable; read-only
- `src/types/index.ts` — no new types needed for this task

## Implementation Steps

### Step 1: Add `findForLicensee` to `RoomRepositoryDatabase`

In `src/app/repositories/room.ts`, add a method to `RoomRepositoryDatabase`:

```ts
async findForLicensee(licenseeId: any, { status, page = 1, limit = 20 }: { status?: string; page?: number; limit?: number } = {}) {
  const contacts = await this.model().db.model('Contact').find({ licensee: licenseeId }).select('_id').lean()
  const contactIds = contacts.map((c: any) => c._id)
  const filter: any = { contact: { $in: contactIds } }
  if (status) {
    filter.status = status
  } else {
    filter.closed = false
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

This pattern mirrors the contact lookup in `DashboardController.openRooms`.

### Step 2: Create `RoomsController`

Create `src/app/controllers/RoomsController.ts`:

```ts
class RoomsController {
  userRepository: any
  roomRepository: any
  messageRepository: any

  constructor({ userRepository, roomRepository, messageRepository }: Record<string, any> = {}) {
    this.userRepository = userRepository
    this.roomRepository = roomRepository
    this.messageRepository = messageRepository
    this.index = this.index.bind(this)
    this.messages = this.messages.bind(this)
  }

  async index(req: any, res: any) {
    try {
      const user = await this.userRepository.findFirst({ _id: req.userId }, ['licensee'])
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' })

      const licenseeId = user.role === 'super'
        ? (req.query.licensee ?? null)
        : user.licensee?._id ?? user.licensee

      if (!licenseeId) return res.status(400).json({ message: 'Licenciado não identificado.' })

      const page = Math.max(1, parseInt(req.query.page as string) || 1)
      const limit = 20

      const roomResults = await this.roomRepository.findForLicensee(licenseeId, { page, limit })
      const hasMore = roomResults.length > limit
      const rooms = hasMore ? roomResults.slice(0, limit) : roomResults

      // Attach last message to each room
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
    } catch (err: any) {
      return res.status(500).json({ message: `Erro interno do servidor: ${err.message}` })
    }
  }

  async messages(req: any, res: any) {
    try {
      const user = await this.userRepository.findFirst({ _id: req.userId }, ['licensee'])
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' })

      const room = await this.roomRepository.findFirst({ _id: req.params.roomId }, ['contact'])
      if (!room) return res.status(404).json({ message: 'Conversa não encontrada.' })

      // Authorization: room's contact must belong to the user's licensee
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
    } catch (err: any) {
      return res.status(500).json({ message: `Erro interno do servidor: ${err.message}` })
    }
  }
}

export { RoomsController }
```

### Step 3: Wire routes in `resources-routes.ts`

In `src/app/routes/resources-routes.ts`:

1. Import `RoomsController`:
```ts
import { RoomsController } from '../controllers/RoomsController'
```

2. In the composition root (after `createRuntimeDependencies()`):
```ts
const roomsController = new RoomsController({ userRepository, roomRepository, messageRepository })
```

3. Add routes (after existing router registrations, before `export default router`):
```ts
router.get('/rooms', roomsController.index)
router.get('/rooms/:roomId/messages', roomsController.messages)
```

### Step 4: Write `RoomsController.spec.ts`

Follow the pattern of existing controller specs (e.g., `DashboardController.spec.ts` or `MessagesController.spec.ts`). Use the Memory repository variants.

Tests to write:
- `index` — returns rooms for user's licensee; super can filter by `?licensee=`; 400 when super provides no licensee; 404 for unknown user
- `index` — pagination: `hasMore: true` when > 20 rooms exist
- `messages` — returns messages sorted by `createdAt` asc for valid room; 403 when user's licensee doesn't match room's contact licensee; 404 for unknown room

## Testing

- [ ] `RoomsController.spec.ts` covers: index (happy path, super filter, no-licensee 400, pagination), messages (happy path, 403 cross-licensee, 404 unknown room)
- [ ] Existing backend tests still pass: `npx jest`
- [ ] `npx eslint .` produces no new errors

## Documentation / KB Updates

- [ ] No KB/doc updates required — this follows the established controller pattern. If the pattern diverges significantly, run `document-solution` after completion.

## Completion Criteria

- [ ] `GET /resources/rooms` returns open rooms with populated contact + lastMessage
- [ ] `GET /resources/rooms/:roomId/messages` returns paginated message list; 403 on cross-licensee access
- [ ] All new and existing backend tests pass
- [ ] Lint clean
- [ ] Status updated to `complete` in `status.md`
- [ ] Changes committed to `plan/local-chat-ui/phase-1/task-01-rooms-api`

## Conflict Avoidance Notes

No sibling tasks in Phase 1.
