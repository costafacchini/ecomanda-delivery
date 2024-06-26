const { Queue } = require('bullmq')
const { redisConnection } = require('@config/redis')

const jobs = require('../app/jobs')

const queueOptions = {
  defaultJobOptions: {
    backoff: {
      type: 'exponential',
      delay: 100,
    },
    attempts: 1,
    removeOnComplete: true,
    removeOnFail: 10000,
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

  async addJob(name, body) {
    const queue = this.queues.find((queue) => queue.name === name)

    return await queue.bull.add(name, { body }, { attempts: 1 })
  }
}

module.exports = new QueueServer()
