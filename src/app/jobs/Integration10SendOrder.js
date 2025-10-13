import { sendOrder } from '../services/IntegrationSendOrder.js'

export default {
  key: 'integration-send-order',
  async handle(data) {
    return await sendOrder(data.body)
  },
}
