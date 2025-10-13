import { processPagarmeOrderPaid } from '../services/ProcessPagarmeOrderPaid.js'

export default {
  key: 'process-pagarme-order-paid',
  async handle(data) {
    return await processPagarmeOrderPaid(data.body)
  },
}
