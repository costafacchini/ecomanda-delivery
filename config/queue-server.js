const { Queue } = require('bullmq')
const redisConnection = require('@config/redis')

class QueueServer {
  constructor() {
    this.queueRequest = this._newQueue('request')
    this.queueResolver = this._newQueue('resolver')
    this.queueDispatcher = this._newQueue('dispatcher')
  }

  async addJobRequest(action, body, licensee) {
    await this.queueRequest.add('request', { action, body, licensee }, { attempts: 3 })
  }

  async addJobResolver(body, licensee) {
    await this.queueResolver.add('resolver', { body, licensee }, { attempts: 3 })
  }

  async addJobDispatcher(body, licensee) {
    await this.queueDispatcher.add('dispatcher', { body, licensee }, { attempts: 3 })
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
