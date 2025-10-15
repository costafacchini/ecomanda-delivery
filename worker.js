import 'dotenv/config'
import('./src/app/models/index.js')

import { redisConnection } from './src/config/redis.js'
import { queueServer } from './src/config/queue.js'
import { Worker } from 'bullmq'
import { connect } from './src/config/database.js'
import { consumeChannel } from './src/config/rabbitmq.js'

connect()
consumeChannel()

queueServer.queues.forEach((queue) => {
  const worker = new Worker(
    queue.name,
    async (job) => {
      const handleResult = await queue.handle(job.data)
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
    console.error(`Fail process job ${JSON.stringify(job)} `, failedReason)
  })
})
