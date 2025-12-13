import { randomUUID } from 'crypto'
import { createPinoProvider } from './logger/providers/pino.js'
import { createStdoutProvider } from './logger/providers/stdout.js'

const providers = {
  pino: createPinoProvider,
  stdout: createStdoutProvider,
}

const logLevel = process.env.LOG_LEVEL || 'info' //(debug | info)
const providerName = process.env.NODE_ENV !== 'test' ? 'pino' : 'stdout'
const selectedProvider = providers[providerName] || providers.pino
const provider = selectedProvider()

const callMessage = (level, message, meta) => {
  if (logLevel === 'debug') {
    provider.log({ level, message, meta })
  } else {
    provider.log({ level, message })
  }
}

const logger = {
  log: (message, meta) => callMessage({ level: 'info', message, meta }),
  info: (message, meta) => callMessage({ level: 'info', message, meta }),
  error: (message, meta) => callMessage({ level: 'error', message, meta }),
}

const httpLogger =
  provider.httpLogger ||
  ((req, res, next) => {
    const existing = req.headers['x-request-id']
    const id = existing || randomUUID()
    if (!existing) res.setHeader('x-request-id', id)
    req.id = id
    next()
  })

export { logger, httpLogger }
