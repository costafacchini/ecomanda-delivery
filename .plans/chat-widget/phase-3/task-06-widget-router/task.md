# Task: Widget Router + CORS + 3 Endpoints

**Plan**: Chat Widget
**Phase**: 3
**Task ID (phase-local)**: task-06
**Task Path**: phase-3/task-06-widget-router
**Depends On**: phase-2/task-03-create-widget-session, phase-2/task-04-send-widget-message, phase-2/task-05-get-widget-messages
**JIRA**: N/A

## Objective

Create `src/app/routes/widget-routes.ts` — an Express router that exposes three public endpoints for the embeddable widget, with per-route CORS headers that allow any origin. Register it in `src/config/routes.ts` at `/widget`.

## Context

The widget is loaded on arbitrary external websites, so all three endpoints must respond with `Access-Control-Allow-Origin: *`. The existing `enableCors(app)` in `src/config/cors.ts` already calls `cors()` globally, which sets `Access-Control-Allow-Origin: *` by default — but we should ensure the preflight OPTIONS requests are handled correctly for the widget path.

**Router path**: `/widget` (registered in `src/config/routes.ts`)

**Endpoints**:

| Method | Path | Use Case | Body / Query |
|--------|------|----------|--------------|
| `POST` | `/widget/:apiToken/session` | `CreateWidgetSession` | body: `{ name, email }` |
| `POST` | `/widget/:apiToken/messages` | `SendWidgetMessage` | body: `{ widgetSessionToken, text }` |
| `GET`  | `/widget/:apiToken/messages` | `GetWidgetMessages` | query: `?sessionToken=...&since=...` |

`apiToken` is the licensee's `apiToken` field (from `Licensee.apiToken`).

Pattern to follow: `src/app/routes/v1/v1-routes.ts` — composition root, use case instantiation, request parsing.

### Input Validation

Use `express-validator`. Already installed and used in `v1-routes.ts`.

POST `/session`: `body('name').notEmpty()`, `body('email').isEmail()`, `body('phone').optional().isMobilePhone('any')`
POST `/messages`: `body('widgetSessionToken').notEmpty()`, `body('text').notEmpty()`
GET `/messages`: `query('sessionToken').notEmpty()`

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify all three Phase 2 tasks are `complete`
- [ ] Read `src/app/routes/v1/v1-routes.ts` — composition root pattern
- [ ] Read `src/config/routes.ts` — where to register the new router
- [ ] Read `src/app/runtime/dependencies.ts` — `createRuntimeDependencies` to wire repos
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/routes/widget-routes.ts` | create | Widget router with 3 endpoints |
| `src/app/routes/widget-routes.spec.ts` | create | Integration tests |
| `src/config/routes.ts` | modify | Register widget router at `/widget` |

### Do NOT Modify

- `src/app/routes/v1/v1-routes.ts` — existing API routes
- `src/app/services/SendMessageToMessenger.ts` — owned by task-07
- `src/config/cors.ts` — not needed; existing global cors() is sufficient

## Implementation Steps

### Step 1: Create widget-routes.ts

```ts
import express from 'express'
import cors from 'cors'
import { body, query, param, validationResult } from 'express-validator'
import { sanitizeExpressErrors } from '../helpers/SanitizeErrors'
import { CreateWidgetSession } from '../usecases/widget/CreateWidgetSession'
import { SendWidgetMessage } from '../usecases/widget/SendWidgetMessage'
import { GetWidgetMessages } from '../usecases/widget/GetWidgetMessages'
import { createRuntimeDependencies } from '../runtime/dependencies'

const router = express.Router()

// Allow all origins — widget is loaded on external sites
router.use(cors())

function validate(req: any, res: any, next: any) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
  }
  next()
}

const { licenseeRepository, contactRepository, messageRepository, roomRepository } = createRuntimeDependencies()

const createWidgetSession = new CreateWidgetSession({ licenseeRepository, contactRepository })
const sendWidgetMessage = new SendWidgetMessage({ licenseeRepository, contactRepository, messageRepository, roomRepository })
const getWidgetMessages = new GetWidgetMessages({ licenseeRepository, contactRepository, roomRepository, messageRepository })

// POST /widget/:apiToken/session
router.post(
  '/:apiToken/session',
  [param('apiToken').notEmpty(), body('name').notEmpty(), body('email').isEmail()],
  validate,
  async (req: any, res: any) => {
    try {
      const result = await createWidgetSession.execute({
        apiToken: req.params.apiToken,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,   // optional — undefined if not sent
      })
      return res.status(200).json(result)
    } catch (err: any) {
      if (err.message?.includes('Licensee not found')) return res.status(404).json({ message: err.message })
      return res.status(500).json({ message: 'Erro interno do servidor.' })
    }
  },
)

// POST /widget/:apiToken/messages
router.post(
  '/:apiToken/messages',
  [param('apiToken').notEmpty(), body('widgetSessionToken').notEmpty(), body('text').notEmpty().trim()],
  validate,
  async (req: any, res: any) => {
    try {
      const message = await sendWidgetMessage.execute({
        apiToken: req.params.apiToken,
        widgetSessionToken: req.body.widgetSessionToken,
        text: req.body.text,
      })
      return res.status(201).json({ messageId: message._id.toString() })
    } catch (err: any) {
      if (err.message?.includes('not found')) return res.status(404).json({ message: err.message })
      return res.status(500).json({ message: 'Erro interno do servidor.' })
    }
  },
)

// GET /widget/:apiToken/messages
router.get(
  '/:apiToken/messages',
  [param('apiToken').notEmpty(), query('sessionToken').notEmpty()],
  validate,
  async (req: any, res: any) => {
    try {
      const since = req.query.since ? new Date(req.query.since as string) : undefined
      const messages = await getWidgetMessages.execute({
        apiToken: req.params.apiToken,
        widgetSessionToken: req.query.sessionToken as string,
        since,
      })
      return res.status(200).json({ messages })
    } catch (err: any) {
      if (err.message?.includes('not found')) return res.status(404).json({ message: err.message })
      return res.status(500).json({ message: 'Erro interno do servidor.' })
    }
  },
)

export default router
```

### Step 2: Register in routes.ts

In `src/config/routes.ts`, add:

```ts
import widgetRoutes from '../app/routes/widget-routes'
// ...
function routes(app: any) {
  app.use('/widget', widgetRoutes)   // ← add before existing routes
  app.use('/resources', resourcesRoutes)
  // ...
}
```

### Step 3: Write integration specs

`src/app/routes/widget-routes.spec.ts` — use `supertest` + `installMemoryRepositories()`. Cover:
- POST `/widget/:token/session` 200 with valid body
- POST `/widget/:token/session` 422 with missing email
- POST `/widget/:token/messages` 201 with valid session token + text
- GET `/widget/:token/messages` 200 returns messages array
- GET `/widget/:token/messages` 422 when sessionToken missing

## Testing

- [ ] 5 integration specs pass
- [ ] `yarn test src/app/routes/widget-routes.spec.ts` green
- [ ] `yarn typecheck` passes

## Documentation / KB Updates

After this task completes, run `document-solution` to capture the widget API pattern (new public endpoint category with no JWT auth, apiToken in path).

## Completion Criteria

- [ ] All 3 endpoints respond correctly
- [ ] 422 validation errors for bad input
- [ ] CORS headers present (`Access-Control-Allow-Origin: *`)
- [ ] Router registered in `src/config/routes.ts`
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-07 runs in parallel — it modifies `src/app/services/SendMessageToMessenger.ts` which is not touched by this task.
