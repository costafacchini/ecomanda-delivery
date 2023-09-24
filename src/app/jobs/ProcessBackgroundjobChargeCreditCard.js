const processBackgroundjobChargeCreditCard = require('../services/ProcessBackgroundjobChargeCreditCard')

module.exports = {
  key: 'process-backgroundjob-charge-credit-card',
  async handle(data) {
    return await processBackgroundjobChargeCreditCard(data.body)
  },
}
