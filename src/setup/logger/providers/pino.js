import { randomUUID } from 'crypto'
import pino from 'pino'
import pinoHttp from 'pino-http'

const level = process.env.LOG_LEVEL || 'info' //(debug | info)
const usePretty = process.env.LOG_PRETTY !== 'false'
const serviceName = process.env.LOG_SERVICE_NAME || 'ecomanda-hub'

const transport = usePretty
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: true,
        translateTime: 'SYS:standard',
      },
    }
  : undefined

function createLogger() {
  return pino({
    level,
    transport,
    timestamp: pino.stdTimeFunctions.isoTime,
    base: { service: serviceName },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.token',
        'password',
        'token',
        'authorization',
        'accessToken',
        'refreshToken',
      ],
      censor: '[REDACTED]',
    },
  })
}

function createHttpLogger(logger) {
  return pinoHttp({
    logger,
    genReqId(req, res) {
      const existing = req.headers['x-request-id']
      if (existing) return existing

      const id = randomUUID()
      res.setHeader('x-request-id', id)
      return id
    },
    serializers: {
      err: pino.stdSerializers.err,
    },
  })
}

function createPinoProvider() {
  const logger = createLogger()
  const httpLogger = createHttpLogger(logger)

  const log = ({ level, message, meta }) => {
    const logMethod = logger[level] || logger.info
    if (meta && message) {
      logMethod.call(logger, meta, message)
      return
    }
    if (meta) {
      logMethod.call(logger, meta)
      return
    }
    logMethod.call(logger, message)
  }

  return { log, httpLogger }
}

export { createPinoProvider }
