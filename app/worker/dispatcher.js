const { Worker } = require('bullmq')
const redisConnection = require('../../config/redis')
const closeChat = require('../services/close-chat')
const sendMessageToMessenger = require('../services/send-message-to-messenger')
const sendMessageToChat = require('../services/send-message-to-chat')
const sendMessageToChatbot = require('../services/send-message-to-chatbot')

class WorkerDispatcher {
  async constructor(queueName) {
    this.worker = new Worker(queueName, async job => {
      switch (job.data.action) {
        case 'send-message-to-messenger':
          await sendMessageToMessenger(job.data.body, job.data.licensee)
          break
        case 'close-chat':
          await closeChat(job.data.body, job.data.licensee)
          break
        case 'send-message-to-chat':
          await sendMessageToChat(job.data.body, job.data.licensee)
          break
        case 'send-message-to-chatbot':
          await sendMessageToChatbot(job.data.body, job.data.licensee)
          break
        default:
          throw `Ação não reconhecida no work dispatcher: ${job.data.action}`
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

module.exports = WorkerDispatcher
