import processBackgroundjobInviteCreditCard from '../services/ProcessBackgroundjobInviteCreditCard.js'

export default {
  key: 'process-backgroundjob-invite-credit-card',
  async handle(data) {
    return await processBackgroundjobInviteCreditCard(data.body)
  },
}
