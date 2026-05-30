import 'dotenv/config'
import('./src/app/models/index')

import { redisConnection } from './src/config/redis'
import { queueServer } from './src/config/queue'
import { Worker } from 'bullmq'
import { connect } from './src/config/database'
import { withTrafficlight, resolveTrafficlightKey } from './src/app/services/Trafficlight'
import { jobDependencies } from './src/app/jobs/dependencies'

connect()

const queuesWithWorkerEnabled = queueServer.queues.filter((queue) => queue.workerEnabled == true)

queuesWithWorkerEnabled.forEach((queue) => {
  const worker = new Worker(
    queue.name,
    async (job) => {
      const lockKey = resolveTrafficlightKey(job?.data)
      const handleResult = await withTrafficlight(
        lockKey,
        async () => {
          return await queue.handle(job.data)
        },
        { trafficlightRepository: jobDependencies.trafficlightRepository },
      )
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
