const { Queue } = require('bullmq')
const redisConnection = require('@config/redis')

class QueueServer {
  constructor() {
    this.queueResolver = this._newQueue('resolver')
    this.queueResolver = this._newQueue('dispatcher')
  }

  async addJobResolver(action, body, licensee) {
    await this.queueResolver.add('resolver', { action, body, licensee }, { attempts: 3 })
  }

  async addJobDispatcher(action, body, licensee) {
    await this.queueResolver.add('dispatcher', { action, body, licensee }, { attempts: 3 })
  }

  _newQueue(name) {
    return new Queue(name, {
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
    })
  }
}

const queue = new QueueServer()

module.exports = { queue }
