const { Queue } = require('bullmq')
const redis = require('@config/redis')

class QueueServer {
  constructor() {
    this.queueRequest = this._newQueue('request')
    this.queueResolver = this._newQueue('resolver')
    this.queueDispatcher = this._newQueue('dispatcher')
  }

  async addJobRequest(body, token) {
    await this.queueRequest.add('request', { body, token }, { attempts: 3 })
  }

  async addJobResolver(body, token) {
    await this.queueResolver.add('resolver', { body, token }, { attempts: 3 })
  }

  async addJobDispatcher(body, token) {
    await this.queueDispatcher.add('dispatcher', { body, token }, { attempts: 3 })
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
      redis,
    })
  }
}

const queueServer = new QueueServer()

module.exports = { queueServer }
