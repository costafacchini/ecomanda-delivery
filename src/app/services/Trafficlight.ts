import { randomUUID } from 'crypto'

const LOCK_TTL_MS = Number(process.env.JOB_LOCK_TTL_MS ?? 120000)
const RETRY_DELAY_MS = Number(process.env.JOB_LOCK_RETRY_DELAY_MS ?? 100)

const sleep = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms))

async function acquireLock(lockKey: any, token: any, trafficlightRepository: any) {
  while (true) {
    try {
      const expiresAt = new Date(Date.now() + LOCK_TTL_MS)
      await trafficlightRepository.create({ key: lockKey, token, expiresAt })
      return
    } catch (error) {
      if (error?.code !== 11000) {
        throw error
      }

      await sleep(RETRY_DELAY_MS)
    }
  }
}

export function resolveTrafficlightKey(data: any) {
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

export async function withTrafficlight(lockKey: any, handler: any, { trafficlightRepository }: Record<string, any> = {}) {
  if (!lockKey) {
    return await handler()
  }

  const token = randomUUID()
  await acquireLock(lockKey, token, trafficlightRepository)

  try {
    return await handler()
  } finally {
    await trafficlightRepository.delete({ key: lockKey, token })
  }
}
