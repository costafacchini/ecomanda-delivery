const { Queue } = require('bullmq')
const redisConnection = require('@config/redis')

const jobs = require('../app/jobs/index')

const queueOptions = {
  defaultJobOptions: {
    backoff: {
      type: 'exponential',
      delay: 100,
    },
    attempts: 3,
    removeOnComplete: true,
    removeOnFail: true,
  },
  redisConnection,
}

function createQueue(name) {
  return new Queue(name, queueOptions)
}

// const queues = Object.values(jobs).map(job => ({
//   bull: createQueue(job.key),
//   name: job.key,
//   handle: job.handle,
// }))
//
// async function addJob(name, body, licensee) {
//   const queue = queues.find(queue => queue.name === name)
//   return await queue.bull.add(name, { body, licensee }, { attempts: 3 })
// }

// const queueServer = {
//   queues,
//   addJob
// }

class QueueServer {
    constructor() {
      this.queues = Object.values(jobs).map(job => ({
        bull: createQueue(job.key),
        name: job.key,
        handle: job.handle,
      }))
    }

  async addJob(name, body, licensee) {
    const queue = this.queues.find(queue => queue.name === name)
    return await queue.bull.add(name, { body, licensee }, { attempts: 3 })
  }
}

const queueServer = new QueueServer()

module.exports = queueServer
