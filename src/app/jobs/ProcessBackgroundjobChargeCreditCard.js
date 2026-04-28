import { processBackgroundjobChargeCreditCard } from '../services/ProcessBackgroundjobChargeCreditCard.js'
import { jobDependencies } from './dependencies.js'

export default {
  key: 'process-backgroundjob-charge-credit-card',
  workerEnabled: true,
  async handle(data) {
    return await processBackgroundjobChargeCreditCard(data.body, jobDependencies)
  },
}
