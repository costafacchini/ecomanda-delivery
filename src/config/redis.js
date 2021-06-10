const Redis = require('ioredis')

const REDIS_URL = process.env.REDIS_TLS_URL || process.env.REDIS_URL

const createRedis = function () {
  if (REDIS_URL.includes('rediss')) {
    return new Redis(REDIS_URL, {
      tls: {
        rejectUnauthorized: false,
      },
    })
  } else {
    return new Redis(REDIS_URL)
  }
}

const redisConnection = createRedis()

module.exports = { redisConnection }
