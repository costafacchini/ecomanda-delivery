const processBackgroundjobGetPix = require('../services/ProcessBackgroundjobGetPix')

module.exports = {
  key: 'process-backgroundjob-cancel-order',
  async handle(data) {
    return await processBackgroundjobGetPix(data.body)
  },
}
