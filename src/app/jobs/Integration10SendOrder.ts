import { sendOrder } from '../services/IntegrationSendOrder'
import { jobDependencies } from './dependencies'

export default {
  key: 'integration-send-order',
  workerEnabled: true,
  async handle(data: any) {
    return await sendOrder(data.body, jobDependencies)
  },
}
