import { processPagarmeOrderPaid } from '../services/ProcessPagarmeOrderPaid.js'

export default {
  key: 'process-pagarme-order-paid',
  workerEnabled: true,
  async handle(data) {
    return await processPagarmeOrderPaid(data.body)
  },
}
