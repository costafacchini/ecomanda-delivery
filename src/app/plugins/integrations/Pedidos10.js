const Order = require('./Pedidos10/Order')

class Pedidos10 {
  constructor(licensee) {
    this.licensee = licensee
  }

  async processOrder(body) {
    const orderProcessed = new Order(body, this.licensee)
    await orderProcessed.loadOrderFromDatabase()
    return await orderProcessed.save()
  }

  sendOrder(order) {
    try {
      if (this.licensee.pedidos10_integrator == '') {
        order.integration_status = 'done'
      } else {
        throw new Error('implementar quando tiver o primeiro integrador')
        // chamar uma factory para criar o gerenciador
        // fazer o gerenciador enviar o pedido
        // gravar o resultado da requisição
      }
    } catch (err) {
      order.integration_status = 'error'
      order.integration_error = err.toString()
    }

    return order
  }
}

module.exports = Pedidos10
