const processPagarmeOrderPaid = require('../services/ProcessPagarmeOrderPaid')

module.exports = {
  key: 'process-pagarme-order-paid',
  async handle(data) {
    return await processPagarmeOrderPaid(data.body)
  },
}
