import 'dotenv/config'
import './instrument.mjs'
import('./src/app/models/index.js')

import { redisConnection } from './src/config/redis.js'
import { queueServer } from './src/config/queue.js'
import { Worker } from 'bullmq'
import { connect } from './src/config/database.js'
// import { consumeChannel } from './src/config/rabbitmq.js'
import { withTrafficlight, resolveTrafficlightKey } from './src/app/helpers/Trafficlight.js'
import { logger } from './src/setup/logger.js'

connect()
// consumeChannel()

const queuesWithWorkerEnabled = queueServer.queues.filter((queue) => queue.workerEnabled == true)

queuesWithWorkerEnabled.forEach((queue) => {
  const worker = new Worker(
    queue.name,
    async (job) => {
      const lockKey = resolveTrafficlightKey(job?.data)
      const handleResult = await withTrafficlight(lockKey, async () => {
        return await queue.handle(job.data)
      })
      if (handleResult) {
        for (const actionJob of handleResult) {
          const { action, body } = actionJob

          await queueServer.addJob(action, body)
        }
      }
    },
    { connection: redisConnection },
  )

  redisConnection.setMaxListeners(redisConnection.getMaxListeners() + 1)

  worker.on('failed', (job, failedReason) => {
    logger.error(
      {
        err: failedReason,
        queue: queue.name,
        jobId: job?.id,
        requestId: job?.data?.requestId,
      },
      'Failed to process job',
    )
  })
})
