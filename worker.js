require('dotenv').config()
require('module-alias/register')

const { redisConnection } = require('@config/redis')
const queueServer = require('@config/queue')
const { Worker } = require('bullmq')

queueServer.queues.forEach(queue => {
  const worker = new Worker(queue.name, async job => {
    const handleResult = await queue.handle(job.data)
    if (handleResult) {
      for (const actionJob of handleResult) {
        const { action, body, licensee } = actionJob

        await queueServer.addJob(action, body, licensee)
      }
    }
  }, { connection: redisConnection })

  redisConnection.setMaxListeners(redisConnection.getMaxListeners() + 1)

  worker.on('failed', (job, failedReason) => {
    console.error(`Complete process job ${job} `, failedReason)
  })
})
