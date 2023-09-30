const processBackgroundjobInviteCreditCard = require('../services/ProcessBackgroundjobInviteCreditCard')

module.exports = {
  key: 'process-backgroundjob-invite-credit-card',
  async handle(data) {
    return await processBackgroundjobInviteCreditCard(data.body)
  },
}
