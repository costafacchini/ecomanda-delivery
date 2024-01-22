const sendOrder = require('../services/Pedidos10SendOrder')

module.exports = {
  key: 'pedidos10-send-order',
  async handle(data) {
    return await sendOrder(data.body)
  },
}
