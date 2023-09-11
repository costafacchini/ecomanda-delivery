const processBackgroundjobGetPix = require('../services/ProcessBackgroundjobGetPix')

module.exports = {
  key: 'process-backgroundjob-get-pix',
  async handle(data) {
    return await processBackgroundjobGetPix(data.body)
  },
}
