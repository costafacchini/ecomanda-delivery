# Task: Baileys QR Code Endpoint

**Plan**: Baileys WhatsApp Plugin
**Phase**: 5
**Task ID (phase-local)**: task-05
**Task Path**: phase-5/task-05-qr-endpoint
**Depends On**: phase-3/task-03-plugin
**JIRA**: N/A

## Objective

Add a `POST /resources/licensees/:id/baileys-qr` endpoint that initiates a Baileys connection for the licensee and returns a QR code string for the admin to scan with their phone.

## Context

The Dialog plugin follows this pattern for one-off admin actions:
- Route: `POST /resources/licensees/:id/dialogwebhook` → `resources-routes.js:129`
- Controller: `LicenseesController.setDialogWebhook()` → `LicenseesController.js:135`
- Usecase: `SetDialogWebhook.js` — loads licensee, calls plugin method

Mirror this exact pattern for Baileys QR.

**How Baileys QR works:**
1. `makeWASocket({ auth })` opens connection
2. If session is new/expired, Baileys emits a `connection.update` event with a `qr` field
3. `qr` is a raw string (the WhatsApp connection URI)
4. The frontend renders it as a QR image using a JS library

**Endpoint contract:**
- Request: `POST /resources/licensees/:id/baileys-qr`
- Response (success): `{ qr: '<baileys-qr-string>' }` — 200
- Response (already connected): `{ message: 'Já conectado' }` — 200
- Response (timeout — QR not received in time): `{ message: 'Timeout ao gerar QR' }` — 408

**QR generation strategy (async to sync bridge):**
The `getQrCode()` method on `Baileys.js` must:
1. Load or create session from `whatsappSessionRepository`
2. Open a Baileys socket with that auth state
3. Listen for `connection.update` event
4. If `qr` arrives within timeout (15s): return it, close socket
5. If connection opens (already authenticated): return null (already connected)
6. If timeout: throw error

Files involved:
- `src/app/plugins/messengers/Baileys.js` — add `getQrCode()` method
- `src/app/usecases/licensees/GetBaileysQr.js` — new usecase
- `src/app/controllers/LicenseesController.js` — add `getBaileysQr()` method
- `src/app/routes/resources-routes.js` — add route

## Before You Start

- [ ] Verify `phase-3/task-03-plugin` status is `complete`
- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/baileys-plugin/phase-5/task-05-qr-endpoint`
- [ ] Read `src/app/usecases/licensees/SetDialogWebhook.js` — understand usecase pattern
- [ ] Read `src/app/controllers/LicenseesController.js` lines 135-143 — understand controller pattern
- [ ] Read `src/app/routes/resources-routes.js` lines 125-136 — understand route registration
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/messengers/Baileys.js` | modify | Add `getQrCode()` method |
| `src/app/usecases/licensees/GetBaileysQr.js` | create | New usecase |
| `src/app/controllers/LicenseesController.js` | modify | Add `getBaileysQr()` method and wire usecase |
| `src/app/routes/resources-routes.js` | modify | Add POST route |

### Do NOT Modify

- `src/app/plugins/messengers/Baileys.spec.js` — owned by phase-4/task-04-tests
- `src/app/repositories/testing.js` — finalized in phase-2
- Frontend files — owned by phase-6/task-06-admin-form

## Implementation Steps

### Step 1: Add getQrCode() to Baileys.js

```js
async getQrCode(timeoutMs = 15000) {
  const session = await this.loadOrCreateSession()

  const authState = {
    creds: session.creds ?? {},
    keys: session.keys ?? {},
  }

  return new Promise((resolve, reject) => {
    const socket = makeWASocket({ auth: authState, printQRInTerminal: false })
    const timer = setTimeout(() => {
      socket.end()
      reject(new Error('Timeout ao gerar QR Code'))
    }, timeoutMs)

    socket.ev.on('connection.update', async ({ qr, connection }) => {
      if (qr) {
        clearTimeout(timer)
        socket.end()
        resolve(qr)
      }

      if (connection === 'open') {
        clearTimeout(timer)
        socket.end()
        resolve(null) // already authenticated
      }
    })

    socket.ev.on('creds.update', async (creds) => {
      await this.saveSession(session, creds, session.keys)
    })
  })
}
```

### Step 2: Create GetBaileysQr.js usecase

Create `src/app/usecases/licensees/GetBaileysQr.js` mirroring `SetDialogWebhook.js`:

```js
class GetBaileysQr {
  constructor({ licenseeRepository, createMessengerPlugin } = {}) {
    this.licenseeRepository = licenseeRepository
    this.createMessengerPlugin = createMessengerPlugin
  }

  async execute(id) {
    const licensee = await this.licenseeRepository.findFirst({ _id: id })

    if (licensee.whatsappDefault !== 'baileys') {
      return { message: 'Licensee não usa Baileys' }
    }

    const plugin = this.createMessengerPlugin(licensee)
    const qr = await plugin.getQrCode()

    if (!qr) {
      return { message: 'Já conectado' }
    }

    return { qr }
  }
}

export { GetBaileysQr }
```

### Step 3: Add getBaileysQr to LicenseesController.js

Read the full controller first to match constructor pattern. Add:
1. Import `GetBaileysQr` in constructor dependencies
2. Instantiate: `this.getBaileysQrUseCase = new GetBaileysQr({ licenseeRepository, createMessengerPlugin })`
3. Add method:
```js
async getBaileysQr(req, res) {
  try {
    const response = await this.getBaileysQrUseCase.execute(req.params.id)
    return res.status(200).send(response)
  } catch (error) {
    return res.status(408).send({ message: error.message })
  }
}
```

### Step 4: Add route to resources-routes.js

After the `dialogwebhook` route (line ~129):
```js
router.post('/licensees/:id/baileys-qr', (req, res) => licenseeController.getBaileysQr(req, res))
```

## Testing

- [ ] `npx jest src/app/usecases/licensees/GetBaileysQr.spec.js` (write minimal spec):
  - Returns `{ qr: '...' }` when plugin returns a QR string
  - Returns `{ message: 'Já conectado' }` when plugin returns null
  - Returns 408 on timeout (controller test)
- [ ] `npx jest` — full suite passes
- [ ] `npx eslint src/app/usecases/licensees/GetBaileysQr.js` clean
- [ ] Manual: `curl -X POST http://localhost:5000/resources/licensees/:id/baileys-qr` returns QR string

## Documentation / KB Updates

- [ ] No KB doc required — pattern mirrors SetDialogWebhook exactly

## Completion Criteria

- [ ] `getQrCode()` implemented in `Baileys.js`
- [ ] `GetBaileysQr` usecase created
- [ ] Controller method `getBaileysQr` added and wired
- [ ] Route registered at `POST /resources/licensees/:id/baileys-qr`
- [ ] Minimal usecase spec written and passing
- [ ] All existing tests pass
- [ ] ESLint clean
- [ ] Changes committed to `plan/baileys-plugin/phase-5/task-05-qr-endpoint`
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

No parallel tasks in Phase 5 — this is the only task.
