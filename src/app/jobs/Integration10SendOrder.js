import { sendOrder } from '../services/IntegrationSendOrder.js'
import { jobDependencies } from './dependencies.js'

export default {
  key: 'integration-send-order',
  workerEnabled: true,
  async handle(data) {
    return await sendOrder(data.body, jobDependencies)
  },
}
