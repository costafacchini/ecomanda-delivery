const processBackgroundjobGetCreditCard = require('../services/ProcessBackgroundjobGetCreditCard')

module.exports = {
  key: 'process-backgroundjob-get-credit-card',
  async handle(data) {
    return await processBackgroundjobGetCreditCard(data.body)
  },
}
