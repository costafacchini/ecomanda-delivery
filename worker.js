const { Worker } = require('bullmq')
const redis = require('@config/redis')

const worker = new Worker('job', async job => {
  console.log(`Processando o job: ${JSON.stringify(job.data)}`)
}, { redis })

worker.on('completed', (job) => {
  console.log(`Complete process job ${JSON.stringify(job)}`)
})

worker.on('failed', (job, failedReason) => {
  console.error(`Complete process job ${job} `, failedReason)
})
