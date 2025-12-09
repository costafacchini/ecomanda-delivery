import { processBackgroundjobCancelOrder } from '../services/ProcessBackgroundjobCancelOrder.js'

export default {
  key: 'process-backgroundjob-cancel-order',
  workerEnabled: true,
  async handle(data) {
    return await processBackgroundjobCancelOrder(data.body)
  },
}
