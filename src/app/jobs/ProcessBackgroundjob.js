const processBackgroundjob = require('../services/ProcessBackgroundjob')

module.exports = {
  key: 'background-job',
  async handle(data) {
    return await processBackgroundjob(data.body)
  },
}
