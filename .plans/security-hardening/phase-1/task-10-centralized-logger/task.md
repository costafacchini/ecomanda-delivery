# Task: Centralized Logger

**Plan**: Security Hardening
**Phase**: 1
**Task ID (phase-local)**: task-10
**Task Path**: phase-1/task-10-centralized-logger
**Depends On**: None
**JIRA**: N/A

## Objective

Replace all `console.*` calls across the codebase with a centralized `logger` abstraction that:
- Suppresses metadata (e.g. `req.body`) at `info` level — preventing PII from appearing in production logs
- Exposes full detail (message + meta) at `debug` level — for active investigation sessions
- Sends exceptions to Sentry when `SENTRY_DSN` is configured
- Keeps the implementation simple: no external logging libraries

This directly fixes the **PII in logs** security finding and reduces noise — today it is hard to find useful information because every request logs full payloads.

## Context

**No Pino.** `sentry-and-logs` (PR #2401) introduced Pino, but this task intentionally avoids that dependency. A plain JS logger is sufficient and easier to reason about.

**Sentry is already initialized** via `instrument.mjs` using `process.env.SENTRY_DSN`. We only need to call `Sentry.captureException()` — no second `Sentry.init()`.

**`LOG_LEVEL` env var**: `info` (default/production) | `debug` (investigation mode).
- `info`: logs message only — no meta arg is ever serialized
- `debug`: logs message + meta

**26 source files** currently use `console.*` (controllers, plugins, services). **22 spec files** mock `console` via `jest.spyOn` — these all need updating to mock `logger` instead.

### Logger contract

```js
logger.info(message)            // always: log if level >= info
logger.info(message, meta)      // info: logs message only; debug: logs message + meta
logger.warn(message, meta)      // same meta behaviour as info
logger.error(message, meta)     // logs always; sends to Sentry if SENTRY_DSN set
logger.fatal(message, meta)     // logs always; sends to Sentry if SENTRY_DSN set
logger.debug(message, meta)     // only logs when LOG_LEVEL=debug
```

**The critical rule**: never pass `req.body`, full response payloads, or user data as the `message`. That data only goes in `meta`, which is suppressed at `info` level.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Check `@sentry/node` is in `package.json` dependencies (needed for `captureException`)
- [ ] Run `npx jest` once to get a passing baseline
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/setup/logger.js` | create | The logger module |
| `src/app/controllers/BackupsController.js` | modify | Replace console.* |
| `src/app/controllers/CartsController.js` | modify | Replace console.* |
| `src/app/controllers/ChatbotsController.js` | modify | Replace + remove req.body from meta |
| `src/app/controllers/ChatsController.js` | modify | Replace + remove body from meta |
| `src/app/controllers/DelayController.js` | modify | Replace console.* |
| `src/app/controllers/MessengersController.js` | modify | Replace + remove req.body from meta |
| `src/app/controllers/OrdersController.js` | modify | Replace console.* |
| `src/app/plugins/chatbots/Landbot.js` | modify | Replace console.* |
| `src/app/plugins/chats/Chatwoot.js` | modify | Replace console.* |
| `src/app/plugins/chats/Crisp.js` | modify | Replace console.* |
| `src/app/plugins/chats/Cuboup.js` | modify | Replace console.* |
| `src/app/plugins/chats/Rocketchat.js` | modify | Replace console.* |
| `src/app/plugins/integrations/Pedidos10/services/Auth.js` | modify | Replace console.* |
| `src/app/plugins/integrations/Pedidos10/services/OrderStatus.js` | modify | Replace console.* |
| `src/app/plugins/integrations/Pedidos10/services/Webhook.js` | modify | Replace console.* |
| `src/app/plugins/messengers/Baileys.js` | modify | Replace console.* |
| `src/app/plugins/messengers/Base.js` | modify | Replace console.* |
| `src/app/plugins/messengers/Dialog.js` | modify | Replace console.* |
| `src/app/plugins/messengers/Pabbly.js` | modify | Replace console.* |
| `src/app/plugins/messengers/Utalk.js` | modify | Replace console.* |
| `src/app/plugins/messengers/YCloud.js` | modify | Replace console.* |
| `src/app/plugins/payments/PagarMe/Card.js` | modify | Replace console.* |
| `src/app/plugins/payments/PagarMe/Customer.js` | modify | Replace console.* |
| `src/app/plugins/payments/PagarMe/Payment.js` | modify | Replace console.* |
| `src/app/plugins/payments/PagarMe/Recipient.js` | modify | Replace console.* |
| `src/app/plugins/storage/S3.js` | modify | Replace console.* |
| `src/app/services/Backup.js` | modify | Replace console.* |
| `src/app/services/ProcessPagarmeOrderPaid.js` | modify | Replace console.* |
| All 22 spec files with `spyOn(console)` | modify | Mock logger instead |

### Do NOT Modify

- `src/config/http.js` — owned by task-01/task-05
- `src/app/routes/login-route.js` — owned by task-02
- `src/config/routes.js` — owned by task-03
- `instrument.mjs` — Sentry init, leave as-is
- `server.js` — uses `debug` package for startup, leave as-is

## Implementation Steps

### Step 1: Create src/setup/logger.js

```js
import * as Sentry from '@sentry/node'

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 }
const configuredLevel = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info
const isDebug = configuredLevel === LEVELS.debug

function timestamp() {
  return new Date().toISOString()
}

function write(consoleFn, level, message, meta) {
  if (LEVELS[level] < configuredLevel) return
  const prefix = `[${timestamp()}] [${level.toUpperCase()}]`
  if (isDebug && meta !== undefined) {
    consoleFn(`${prefix} ${message}`, meta)
  } else {
    consoleFn(`${prefix} ${message}`)
  }
}

function captureException(message, meta) {
  if (!process.env.SENTRY_DSN) return
  const err = meta instanceof Error ? meta : new Error(message)
  Sentry.captureException(err, meta && !(meta instanceof Error) ? { extra: meta } : undefined)
}

// eslint-disable-next-line no-console
const logger = {
  debug: (message, meta) => write(console.log, 'debug', message, meta),
  info:  (message, meta) => write(console.info, 'info', message, meta),
  warn:  (message, meta) => write(console.warn, 'warn', message, meta),
  error: (message, meta) => { write(console.error, 'error', message, meta); captureException(message, meta) },
  fatal: (message, meta) => { write(console.error, 'fatal', message, meta); captureException(message, meta) },
}

export { logger }
```

### Step 2: Migrate each source file

For every file in the ownership list:

1. Add `import { logger } from '<relative-path>/setup/logger.js'`
2. Replace `console.info(...)` → `logger.info(...)`
3. Replace `console.error(...)` → `logger.error(...)`
4. Replace `console.log(...)` → `logger.debug(...)`

**PII rule — applies to controllers only:** when a controller currently logs `req.body` or `JSON.stringify(req.body)`, keep the body as `meta` (it will be suppressed at `info` level) but **do not embed it in the message string**:

```js
// Before (PII in message string — visible at all levels)
console.info(`Mensagem chegando do plugin de chatbot: ${JSON.stringify(req.body)}`)

// After (PII only in meta — suppressed at info, visible at debug)
logger.info('Mensagem chegando do plugin de chatbot', req.body)
```

**Error objects with response data** — same pattern: keep `response.data` as `meta`, strip it from the message:

```js
// Before
console.error(`Chatwoot erro: ${JSON.stringify(response.data)}`)

// After
logger.error('Chatwoot erro', response.data)
```

### Step 3: Update spec files

For each spec file that uses `jest.spyOn(global.console, 'info').mockImplementation()`:

Replace with:
```js
import { logger } from '<relative-path>/setup/logger.js'

jest.mock('<relative-path>/setup/logger.js', () => ({
  logger: {
    debug: jest.fn(),
    info:  jest.fn(),
    warn:  jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}))
```

And update any assertions from `expect(consoleInfoSpy).toHaveBeenCalledWith(...)` to `expect(logger.info).toHaveBeenCalledWith(...)`.

**Note on meta in test assertions:** since `logger.info('message', meta)` is the new call signature, assertions need to match both arguments:
```js
// If the source passes meta:
expect(logger.info).toHaveBeenCalledWith('Mensagem chegando do plugin de chatbot', req.body)

// If the source does not pass meta:
expect(logger.info).toHaveBeenCalledWith('Agendando backup')
```

## Testing

- [ ] `npx jest` — all 22 migrated spec files pass
- [ ] `grep -r "spyOn.*console" src/ --include="*.spec.js"` returns empty (all spies removed)
- [ ] `grep -r "console\." src/ --include="*.js" | grep -v spec | grep -v "eslint-disable"` returns empty (all calls migrated)
- [ ] Start dev server with `LOG_LEVEL=debug yarn run dev` — confirm meta appears in logs
- [ ] Start dev server without `LOG_LEVEL` — confirm only messages appear (no `req.body`)
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Run `document-solution` after completion — the `LOG_LEVEL`-gated meta pattern and Sentry integration from a plain logger is worth capturing in KB

## Completion Criteria

- [ ] `src/setup/logger.js` created with `LOG_LEVEL` gating and Sentry capture
- [ ] All `console.*` calls in 26 source files replaced with `logger.*`
- [ ] All 22 spec files mock `logger` instead of spying on `console`
- [ ] PII (req.body, response.data) moved to `meta` arg — never interpolated into message string
- [ ] At `LOG_LEVEL=info` (default): no body/payload content in logs
- [ ] At `LOG_LEVEL=debug`: full meta visible
- [ ] `error`/`fatal` calls captured in Sentry when `SENTRY_DSN` is set
- [ ] All tests pass
- [ ] Changes committed to `plan/security-hardening/phase-1/task-10-centralized-logger`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

This task touches many files but none owned by sibling phase 1 tasks (task-01 to task-03 own config/routes files only). Can run in parallel with all other phase 1 tasks.
