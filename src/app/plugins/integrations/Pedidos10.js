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
}

module.exports = Pedidos10
