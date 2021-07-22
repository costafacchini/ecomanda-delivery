require('dotenv').config()
require('module-alias/register')
require('@models/index')

const { redisConnection } = require('@config/redis')
const queueServer = require('@config/queue')
const { Worker } = require('bullmq')
const connect = require('./src/config/database')
connect()

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
    { connection: redisConnection }
  )

  redisConnection.setMaxListeners(redisConnection.getMaxListeners() + 1)

  worker.on('failed', (job, failedReason) => {
    console.error(`Fail process job ${JSON.stringify(job)} `, failedReason)
  })
})
