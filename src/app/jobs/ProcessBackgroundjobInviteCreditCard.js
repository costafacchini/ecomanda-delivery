import { processBackgroundjobInviteCreditCard } from '../services/ProcessBackgroundjobInviteCreditCard.js'

export default {
  key: 'process-backgroundjob-invite-credit-card',
  workerEnabled: true,
  async handle(data) {
    return await processBackgroundjobInviteCreditCard(data.body)
  },
}
