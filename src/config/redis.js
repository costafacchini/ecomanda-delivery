const Redis = require('ioredis')

const REDIS_URL = process.env.REDIS_TLS_URL || process.env.REDIS_URL

const createRedis = function () {
  if (process.env.NODE_ENV === 'test') {
    return new Redis({
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
    })
  } else {
    if (REDIS_URL.includes('rediss')) {
      return new Redis(REDIS_URL, {
        tls: {
          rejectUnauthorized: false,
        },
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
      })
    } else {
      return new Redis(REDIS_URL, {
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
      })
    }
  }
}

const redisConnection = createRedis()

module.exports = { redisConnection }
