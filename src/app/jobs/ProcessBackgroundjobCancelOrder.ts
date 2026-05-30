import { processBackgroundjobCancelOrder } from '../services/ProcessBackgroundjobCancelOrder'
import { jobDependencies } from './dependencies'

export default {
  key: 'process-backgroundjob-cancel-order',
  workerEnabled: true,
  async handle(data) {
    return await processBackgroundjobCancelOrder(data.body, jobDependencies)
  },
}
