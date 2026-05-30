import { captureException, isInitialized } from '@sentry/node'

const LEVELS = Object.freeze({ debug: 0, info: 1, warn: 2, error: 3, fatal: 4 })

const CONSOLE_METHOD = Object.freeze({
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
  fatal: 'error',
})

const activeLevel = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info

function log(level, message, meta) {
  if (LEVELS[level] < activeLevel) return

  const method = CONSOLE_METHOD[level]
  const prefix = `[${level.toUpperCase()}]`

  if (activeLevel <= LEVELS.debug && meta !== undefined) {
    console[method](prefix, message, meta) // eslint-disable-line no-console
  } else {
    console[method](prefix, message) // eslint-disable-line no-console
  }

  if (level === 'error' || level === 'fatal') {
    if (isInitialized()) {
      const exception = meta instanceof Error ? meta : new Error(message)
      captureException(exception, { level: level === 'fatal' ? 'fatal' : 'error' })
    }
  }
}

const logger = {
  debug: (message, meta?) => log('debug', message, meta),
  info: (message, meta?) => log('info', message, meta),
  warn: (message, meta?) => log('warn', message, meta),
  error: (message, meta?) => log('error', message, meta),
  fatal: (message, meta?) => log('fatal', message, meta),
}

export { logger }
