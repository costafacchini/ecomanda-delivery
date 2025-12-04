import { randomUUID } from 'crypto'
import Trafficlight from '../models/Trafficlight.js'

const LOCK_TTL_MS = Number(process.env.JOB_LOCK_TTL_MS ?? 120000)
const RETRY_DELAY_MS = Number(process.env.JOB_LOCK_RETRY_DELAY_MS ?? 100)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function acquireLock(lockKey, token) {
  while (true) {
    try {
      const expiresAt = new Date(Date.now() + LOCK_TTL_MS)
      await Trafficlight.create({ key: lockKey, token, expiresAt })
      return
    } catch (error) {
      if (error?.code !== 11000) {
        throw error
      }

      await sleep(RETRY_DELAY_MS)
    }
  }
}

export function resolveTrafficlightKey(data) {
  const contactId = data?.contactId ?? data?.body?.contactId
  if (contactId) {
    return `contact:${contactId}`
  }

  const licenseeId = data?.licenseeId ?? data?.body?.licenseeId
  if (licenseeId) {
    return `licensee:${licenseeId}`
  }

  return null
}

export async function withTrafficlight(lockKey, handler) {
  if (!lockKey) {
    return await handler()
  }

  const token = randomUUID()
  await acquireLock(lockKey, token)

  try {
    return await handler()
  } finally {
    await Trafficlight.deleteOne({ key: lockKey, token })
  }
}
