import { processBackgroundjobGetCreditCard } from '../services/ProcessBackgroundjobGetCreditCard'
import { jobDependencies } from './dependencies'

export default {
  key: 'process-backgroundjob-get-credit-card',
  workerEnabled: true,
  async handle(data) {
    return await processBackgroundjobGetCreditCard(data.body, jobDependencies)
  },
}
