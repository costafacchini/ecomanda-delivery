import { captureException, isInitialized } from '@sentry/node'

const LEVELS = Object.freeze({ debug: 0, info: 1, warn: 2, error: 3, fatal: 4 })

const CONSOLE_METHOD = Object.freeze({
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
  fatal: 'error',
})

const activeLevel = (LEVELS as any)[process.env.LOG_LEVEL as any] ?? LEVELS.info

function log(level: any, message: any, meta: any) {
  if ((LEVELS as any)[level] < activeLevel) return

  const method = (CONSOLE_METHOD as any)[level]
  const prefix = `[${level.toUpperCase()}]`

  if (activeLevel <= LEVELS.debug && meta !== undefined) {
    (console as any)[method](prefix, message, meta) // eslint-disable-line no-console
  } else {
    (console as any)[method](prefix, message) // eslint-disable-line no-console
  }

  if (level === 'error' || level === 'fatal') {
    if (isInitialized()) {
      const exception = meta instanceof Error ? meta : new Error(message)
      captureException(exception, { level: level === 'fatal' ? 'fatal' : 'error' })
    }
  }
}

const logger = {
  debug: (message: any, meta?: any) => log('debug', message, meta),
  info: (message: any, meta?: any) => log('info', message, meta),
  warn: (message: any, meta?: any) => log('warn', message, meta),
  error: (message: any, meta?: any) => log('error', message, meta),
  fatal: (message: any, meta?: any) => log('fatal', message, meta),
}

export { logger }
