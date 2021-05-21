const { Queue } = require('bullmq')
const { redisConnection } = require('@config/redis')

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
  connection: redisConnection,
}

function createQueue(name) {
  return new Queue(name, queueOptions)
}

class QueueServer {
  constructor() {
    this.queues = Object.values(jobs).map((job) => ({
      bull: createQueue(job.key),
      name: job.key,
      handle: job.handle,
    }))
  }

  async addJob(name, body, licensee) {
    const queue = this.queues.find((queue) => queue.name === name)

    return await queue.bull.add(name, { body, licensee }, { attempts: 3 })
  }
}

module.exports = new QueueServer()
