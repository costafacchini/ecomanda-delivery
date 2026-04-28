import { processBackgroundjobInviteCreditCard } from '../services/ProcessBackgroundjobInviteCreditCard.js'
import { jobDependencies } from './dependencies.js'

export default {
  key: 'process-backgroundjob-invite-credit-card',
  workerEnabled: true,
  async handle(data) {
    return await processBackgroundjobInviteCreditCard(data.body, jobDependencies)
  },
}
