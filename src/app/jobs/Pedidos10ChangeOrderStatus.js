const changeOrderStatus = require('../services/Pedidos10ChangeOrderStatus')

module.exports = {
  key: 'pedidos10-change-order-status',
  async handle(data) {
    return await changeOrderStatus(data.body)
  },
}
