import { processBackgroundjobGetCreditCard } from '../services/ProcessBackgroundjobGetCreditCard.js'

export default {
  key: 'process-backgroundjob-get-credit-card',
  workerEnabled: true,
  async handle(data) {
    return await processBackgroundjobGetCreditCard(data.body)
  },
}
