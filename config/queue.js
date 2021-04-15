const { Queue } = require('bullmq')
const redis = require('./redis')

const queue = new Queue('job', {
  defaultJobOptions: {
    backoff: {
      type: 'exponential',
      delay: 100
    },
    attempts: 3,
    removeOnComplete: true,
    removeOnFail: true
  },
  redis
})

module.exports = { queue }