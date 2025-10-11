import 'dotenv/config'
import 'module-alias/register'
import '@models/index'

const { redisConnection } = import('@config/redis')
const queueServer = import('@config/queue')
const { Worker } = import('bullmq')
const connect = import('./src/config/database')
connect()
const { consumeChannel } = import('@config/rabbitmq')
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
