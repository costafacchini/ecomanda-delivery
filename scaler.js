import 'dotenv/config'
import { queueServer } from './src/config/queue.js'

/**
 * Env vars requireds:
 * - REDIS_URL
 * - HEROKU_APP_NAME
 * - HEROKU_TOKEN
 * - WORKER_TYPES (ex: "worker,worker2,worker3,worker4,worker5,worker6")
 *
 * Env vars optionals:
 * - SCALER_INTERVAL_MS (default 60000)
 * - WORKER_MIN (default 1)
 * - WORKER_MAX (default = WORKER_TYPES.length)
 * - BACKLOG_STEP (default 100)
 * - UP_COOLDOWN_MS (default 60000)         // subir: 1 min
 * - DOWN_COOLDOWN_MS (default 900000)      // descer: 15 min
 * - TRANSFORM_WEIGHT (default 0.25)
 * - EXTERNAL_WEIGHT (default 1.0)
 */

const { REDIS_URL, HEROKU_APP_NAME, HEROKU_TOKEN, WORKER_TYPES } = process.env

if (!REDIS_URL || !HEROKU_APP_NAME || !HEROKU_TOKEN || !WORKER_TYPES) {
  console.error('Missing required env vars: REDIS_URL, HEROKU_APP_NAME, HEROKU_TOKEN, WORKER_TYPES')
  process.exit(1)
}

const WORKER_TYPES_LIST = WORKER_TYPES.split(',')
  .map((s) => s.trim())
  .filter(Boolean)

if (WORKER_TYPES_LIST.length === 0) {
  console.error('WORKER_TYPES is empty after parsing.')
  process.exit(1)
}

const INTERVAL_MS = Number(process.env.SCALER_INTERVAL_MS ?? 60_000)

const WORKER_MIN = Number(process.env.WORKER_MIN ?? 1)
const WORKER_MAX = Number(process.env.WORKER_MAX ?? WORKER_TYPES_LIST.length)
const BACKLOG_STEP = Number(process.env.BACKLOG_STEP ?? 100)

const UP_COOLDOWN_MS = Number(process.env.UP_COOLDOWN_MS ?? 60_000)
const DOWN_COOLDOWN_MS = Number(process.env.DOWN_COOLDOWN_MS ?? 900_000)

const TRANSFORM_WEIGHT = Number(process.env.TRANSFORM_WEIGHT ?? 0.25)
const EXTERNAL_WEIGHT = Number(process.env.EXTERNAL_WEIGHT ?? 1.0)

const TRANSFORM_QUEUES = ['chat-message', 'close-chat', 'messenger-message']
const EXTERNAL_QUEUES = ['send-message-to-chat', 'send-message-to-messenger']
// const ALL_QUEUES = [...TRANSFORM_QUEUES, ...EXTERNAL_QUEUES]

// ---------- BullMQ backlog ----------
async function getQueueBacklog(queue) {
  // Backlog = jobs que ainda NÃO estão em execução (waiting/delayed etc.)
  const counts = await queue.getJobCounts('wait', 'delayed', 'prioritized', 'paused')

  return (counts.wait ?? 0) + (counts.delayed ?? 0) + (counts.prioritized ?? 0) + (counts.paused ?? 0)
}

async function getAllBacklogs() {
  const queuesWithWorkerEnabled = queueServer.queues.filter((queue) => queue.workerEnabled == true)
  const pairs = await Promise.all(
    queuesWithWorkerEnabled.map(async (queue) => [queue.name, await getQueueBacklog(queue.bull)]),
  )
  return Object.fromEntries(pairs)
}

// Score ponderado: external queues “valem mais”
function computeScore(backlogs) {
  const transform = TRANSFORM_QUEUES.reduce((sum, q) => sum + (backlogs[q] ?? 0), 0)
  const external = EXTERNAL_QUEUES.reduce((sum, q) => sum + (backlogs[q] ?? 0), 0)

  const score = external * EXTERNAL_WEIGHT + transform * TRANSFORM_WEIGHT

  return { transform, external, score }
}

// 1 + floor(score / BACKLOG_STEP), limitado entre [WORKER_MIN .. WORKER_MAX]
function desiredWorkers(score) {
  const extra = Math.floor(score / BACKLOG_STEP)
  const desired = WORKER_MIN + extra
  return Math.max(WORKER_MIN, Math.min(WORKER_MAX, desired))
}

// ---------- Heroku API (Formation) ----------
const HEROKU_HEADERS = {
  Authorization: `Bearer ${HEROKU_TOKEN}`,
  Accept: 'application/vnd.heroku+json; version=3',
  'Content-Type': 'application/json',
}

// async function getCurrentWorkers() {
//   const url = `https://api.heroku.com/apps/${encodeURIComponent(HEROKU_APP_NAME)}/formation/worker`

//   const res = await fetch(url, { method: 'GET', headers: HEROKU_HEADERS })
//   const text = await res.text()

//   if (!res.ok) {
//     throw new Error(`Heroku GET formation error ${res.status}: ${text}`)
//   }

//   const data = JSON.parse(text)
//   // formation retorna "quantity"
//   return Number(data.quantity)
// }

// async function setWorkers(quantity) {
//   const url = `https://api.heroku.com/apps/${encodeURIComponent(HEROKU_APP_NAME)}/formation/worker`

//   const res = await fetch(url, {
//     method: 'PATCH',
//     headers: HEROKU_HEADERS,
//     body: JSON.stringify({ quantity }),
//   })

//   const text = await res.text()
//   if (!res.ok) {
//     throw new Error(`Heroku PATCH formation error ${res.status}: ${text}`)
//   }
// }

async function getCurrentWorkersDistribution() {
  const byType = {}
  let total = 0

  for (const type of WORKER_TYPES_LIST) {
    const url = `https://api.heroku.com/apps/${encodeURIComponent(
      HEROKU_APP_NAME,
    )}/formation/${encodeURIComponent(type)}`

    const res = await fetch(url, { method: 'GET', headers: HEROKU_HEADERS })
    const text = await res.text()

    if (!res.ok) {
      throw new Error(`Heroku GET formation ${type} error ${res.status}: ${text}`)
    }

    const data = JSON.parse(text)
    const qty = Number(data.quantity ?? 0)
    byType[type] = qty
    total += qty
  }

  return { byType, total }
}

// Liga os primeiros N process types, desliga o resto (Basic = 0 ou 1 por tipo)
async function setTotalWorkers(targetTotal) {
  const updates = []

  for (let i = 0; i < WORKER_TYPES_LIST.length; i++) {
    const type = WORKER_TYPES_LIST[i]
    const quantity = i < targetTotal ? 1 : 0

    const url = `https://api.heroku.com/apps/${encodeURIComponent(
      HEROKU_APP_NAME,
    )}/formation/${encodeURIComponent(type)}`

    updates.push(
      (async () => {
        const res = await fetch(url, {
          method: 'PATCH',
          headers: HEROKU_HEADERS,
          body: JSON.stringify({ quantity }),
        })

        const text = await res.text()
        if (!res.ok) {
          throw new Error(`Heroku PATCH formation ${type} error ${res.status}: ${text}`)
        }
      })(),
    )
  }

  await Promise.all(updates)
}

// ---------- Cooldown + step-down ----------
let lastScaleAt = 0

function canScale(now, current, next) {
  if (next === current) return false

  const isUp = next > current
  const cooldown = isUp ? UP_COOLDOWN_MS : DOWN_COOLDOWN_MS

  return now - lastScaleAt >= cooldown
}

function applyStepDown(current, desired) {
  if (desired < current) return current - 1 // desce 1 por ciclo
  return desired
}

// ---------- Loop ----------
async function tick() {
  const startedAt = Date.now()

  const backlogs = await getAllBacklogs()
  const { transform, external, score } = computeScore(backlogs)

  const desired = desiredWorkers(score)
  // const current = await getCurrentWorkers()
  const { byType, total: currentTotal } = await getCurrentWorkersDistribution()

  const now = Date.now()

  const targetRaw = desired
  // const target = applyStepDown(current, targetRaw)
  const targetTotal = applyStepDown(currentTotal, targetRaw)

  // const meta = {
  //   current,
  //   desired: targetRaw,
  //   target,
  //   score,
  //   external,
  //   transform,
  //   backlogs,
  //   elapsed_ms: now - startedAt,
  // }

  // if (!canScale(now, current, target)) {
  //   console.log('[scaler] no-scale (cooldown or no change)', JSON.stringify(meta))
  //   return
  // }

  // if (target === current) {
  //   console.log('[scaler] no-scale (already at target)', JSON.stringify(meta))
  //   return
  // }

  // await setWorkers(target)
  // lastScaleAt = now

  // console.log('[scaler] scaled', JSON.stringify(meta))

  const meta = {
    currentTotal,
    desiredTotal: targetRaw,
    targetTotal,
    score,
    external,
    transform,
    backlogs,
    byType,
    elapsed_ms: now - startedAt,
  }

  if (!canScale(now, currentTotal, targetTotal)) {
    console.log('[scaler] no-scale (cooldown or no change)', JSON.stringify(meta))
    return
  }

  if (targetTotal === currentTotal) {
    console.log('[scaler] no-scale (already at target)', JSON.stringify(meta))
    return
  }

  await setTotalWorkers(targetTotal)
  lastScaleAt = now

  console.log('[scaler] scaled', JSON.stringify(meta))
}

async function main() {
  console.log(
    `[scaler] started interval=${INTERVAL_MS}ms min=${WORKER_MIN} max=${WORKER_MAX} step=${BACKLOG_STEP} workerTypes=${WORKER_TYPES_LIST.join(
      ',',
    )}`,
  )

  // Loop “forever” (mas no seu caso ele só roda em horários determinados porque você liga/desliga pelo Scheduler)
  while (true) {
    try {
      await tick()
    } catch (err) {
      console.error('[scaler] error', err)
    }
    await new Promise((r) => setTimeout(r, INTERVAL_MS))
  }
}

main()
