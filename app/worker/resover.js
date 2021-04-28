const { Worker } = require('bullmq')
const redisConnection = require('../../config/redis')
const transformChatBody = require('../services/chat-message')
const transformMessengerBody = require('../services/messenger-message')
const transformChatbotBody = require('../services/chatbot-message')
const transformTransferBody = require('../services/chatbot-transfer')

class WorkerResolver {
  async constructor(queueName) {
    this.worker = new Worker(queueName, async job => {
      switch (job.data.action) {
        case 'chat-message':
          await transformChatBody(job.data.body, job.data.licensee)
          break
        case 'messenger-message':
          await transformMessengerBody(job.data.body, job.data.licensee)
          break
        case 'chatbot-message':
          await transformChatbotBody(job.data.body, job.data.licensee)
          break
        case 'chatbot-transfer-to-chat':
          await transformTransferBody(job.data.body, job.data.licensee)
          break
        default:
          throw `Ação não reconhecida no work resolver: ${job.data.action}`
      }
    }, { redisConnection })

    this.worker.on('completed', (job) => {
      console.log(`Complete process job ${JSON.stringify(job)}`)
    })

    this.worker.on('failed', (job, failedReason) => {
      console.error(`Complete process job ${job} `, failedReason)
    })
  }
}

module.exports = WorkerResolver
