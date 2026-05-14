# Research: Centralized Logger — Plain JS + Sentry Node SDK v10

**Date**: 2026-05-14
**Purpose**: Pre-implementation research for security-hardening/phase-1/task-10-centralized-logger

---

## Environment Facts (verified from codebase)

- `package.json` has `"type": "module"` — all src/ files use ESM syntax (`import`/`export`)
- Jest uses Babel (`@babel/plugin-transform-modules-commonjs`) — tests see CommonJS at runtime
- Sentry: `@sentry/node@10.53.1` installed, initialized in `instrument.js` via `--import` flag
- `instrument.js` uses `import * as Sentry from '@sentry/node'` + `Sentry.init()`

---

## Key Findings

### 1. Sentry captureException API

From `node_modules/@sentry/core/build/cjs/exports.js:22`:
```js
function captureException(exception, hint) { ... }
```
- `hint` accepts a `{ level, tags, extra }` capture context object
- For fatal level: pass `{ level: 'fatal' }` — surfaces as separate severity in Sentry UI
- For error level: pass `{ level: 'error' }` (or omit hint)

### 2. Use `isInitialized()` not `process.env.SENTRY_DSN` check

`node_modules/@sentry/core/build/cjs/exports.js:238` exports `isInitialized()` → returns `!!getClient()`.

**Use this guard** because the SDK may be disabled even when `SENTRY_DSN` is set (rate limit, test env). Re-exported from `@sentry/node`.

```js
import { captureException, isInitialized } from '@sentry/node'
if (isInitialized()) captureException(err)
```

### 3. Import pattern — utility modules do NOT call Sentry.init()

Because `instrument.js` runs first (Node `--import` flag), Sentry is already initialized when any module imports `captureException`. Utility modules only call `captureException` — never `Sentry.init()`.

### 4. LOG_LEVEL gating pattern

```js
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 }
const activeLevel = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info
```

- At `info` (default): meta suppressed → no PII in production logs
- At `debug`: full meta emitted for local investigation
- Message is emitted only when `LEVELS[level] >= activeLevel`

### 5. Jest mock pattern (Babel-CJS transform)

```js
jest.mock('../../helpers/logger.js', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}))
```

No `jest.spyOn(console, ...)` needed — mock replaces module entirely. Babel's CJS transform makes this work transparently.

---

## Recommended Implementation

### File location: `src/app/helpers/logger.js`

(Follows existing pattern: `src/app/helpers/` contains reusable utility modules)

```js
import { captureException, isInitialized } from '@sentry/node'

const LEVELS = Object.freeze({ debug: 0, info: 1, warn: 2, error: 3, fatal: 4 })

const CONSOLE_METHOD = Object.freeze({
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
  fatal: 'error', // fatal → stderr
})

const activeLevel = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info

function log(level, message, meta) {
  if (LEVELS[level] < activeLevel) return

  const method = CONSOLE_METHOD[level]
  const prefix = `[${level.toUpperCase()}]`

  if (activeLevel <= LEVELS.debug && meta !== undefined) {
    console[method](prefix, message, meta)
  } else {
    console[method](prefix, message)
  }

  if (level === 'error' || level === 'fatal') {
    if (isInitialized()) {
      const exception = meta instanceof Error ? meta : new Error(message)
      captureException(exception, { level: level === 'fatal' ? 'fatal' : 'error' })
    }
  }
}

const logger = {
  debug: (message, meta) => log('debug', message, meta),
  info:  (message, meta) => log('info', message, meta),
  warn:  (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
  fatal: (message, meta) => log('fatal', message, meta),
}

export { logger }
```

### Usage in source files

```js
import { logger } from '../../helpers/logger.js'

// Replace: console.info('Backup efetuado com sucesso!')
logger.info('Backup efetuado com sucesso!')

// Replace: console.error('Não consegui criar a mensagem:', error)
logger.error('Não consegui criar a mensagem', error)

// Replace: console.warn(`Tipo não suportado ${kind}`)
logger.warn(`Tipo não suportado ${kind}`)
```

### Jest mock for Sentry assertions

```js
jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
  isInitialized: jest.fn().mockReturnValue(true),
}))
```

---

## Design Decisions

| Decision | Rationale |
|---|---|
| `isInitialized()` guard | Reflects actual SDK state, not just env var presence |
| `meta instanceof Error` branch | `captureException` needs a real Error for stack trace; wrap strings as needed |
| `fatal` → Sentry `level: 'fatal'` | Surfaces as separate severity in Sentry UI |
| Meta suppressed at `info` and above | Prevents PII in production; debug level for investigation |
| No Winston/Pino | Zero new deps; plain `console.*` delegation unchanged for Heroku Logplex |
| ESM `export { logger }` | Matches all existing source file patterns |

---

## Migration Notes

- 26 source files need `console.*` → `logger.*` migration
- 22 spec files need `jest.spyOn(console)` → `jest.mock('...logger.js')` migration
- Relative import path varies by file depth — use correct relative path
- After implementation, document in `docs/kb/features/centralized-logger.md`
