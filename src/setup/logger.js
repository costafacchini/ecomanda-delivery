import { randomUUID } from 'crypto'
import pino from 'pino'
import pinoHttp from 'pino-http'

const env = process.env.NODE_ENV || 'development'
const isDev = env !== 'production'
const level = process.env.LOG_LEVEL || (isDev ? 'debug' : 'info')
const usePretty = process.env.LOG_PRETTY === 'true' || isDev

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

const logger = pino({
  level,
  transport,
  timestamp: pino.stdTimeFunctions.isoTime,
  base: { service: 'ecomanda-delivery' },
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

const httpLogger = pinoHttp({
  logger,
  customProps: (req) => ({
    requestId: req.id,
  }),
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

export { httpLogger, logger }
