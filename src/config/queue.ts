import { Queue } from 'bullmq'
import { redisConnection } from './redis'

import jobs from '../app/jobs/index'

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

function createQueue(name: any) {
  return new Queue(name, queueOptions)
}

class QueueServer {
  queues: { bull: Queue; name: string; workerEnabled: boolean; handle: (...args: any[]) => any }[]

  constructor() {
    this.queues = jobs.map((job: any) => ({
      bull: createQueue(job.key),
      name: job.key,
      workerEnabled: job.workerEnabled,
      handle: job.handle,
    }))
  }

  async addJob(name: any, body: any) {
    const queue = this.queues.find((queue) => queue.name === name)

    if (!queue) return null

    return await queue.bull.add(name, { body }, { attempts: 1 })
  }
}

export const queueServer = new QueueServer()
