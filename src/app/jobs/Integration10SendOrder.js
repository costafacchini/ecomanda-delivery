import sendOrder from '../services/IntegrationSendOrder'

export default {
  key: 'integration-send-order',
  async handle(data) {
    return await sendOrder(data.body)
  },
}
