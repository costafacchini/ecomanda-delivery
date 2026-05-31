import Redis from 'ioredis'

const REDIS_URL = (process.env.REDIS_TLS_URL || process.env.REDIS_URL) as string

const createRedis = function () {
  if (REDIS_URL.includes('rediss')) {
    return new Redis(REDIS_URL, {
      tls: {
        rejectUnauthorized: false,
      },
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    } as any)
  } else {
    return new Redis(REDIS_URL, {
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    } as any)
  }
}

export const redisConnection = createRedis()

redisConnection.setMaxListeners(redisConnection.getMaxListeners() + 1)
