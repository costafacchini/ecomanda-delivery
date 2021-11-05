const Redis = require('ioredis')

const REDIS_URL = process.env.REDIS_TLS_URL || process.env.REDIS_URL

const createRedis = function () {
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

const redisConnection = createRedis()

module.exports = { redisConnection }
