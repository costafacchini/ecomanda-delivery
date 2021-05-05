require('dotenv').config()
require('module-alias/register')

const redisConnection = require('@config/redis')
const queueServer = require('@config/queue')
const { Worker } = require('bullmq')

queueServer.queues.forEach(queue => {
  const worker = new Worker(queue.name, async job => {
    await queue.handle(job.data)
  }, { redisConnection })

  worker.on('completed', (job) => {
    console.log(`Complete process job ${JSON.stringify(job)}`)
  })

  worker.on('failed', (job, failedReason) => {
    console.error(`Complete process job ${job} `, failedReason)
  })
})
