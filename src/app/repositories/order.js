const Repository = require('./repository')
const Order = require('@models/Order')

class OrderRepositoryDatabase extends Repository {
  async create(fields) {
    return await Order.create({ ...fields })
  }

  async findFirst(params, relations) {
    if (relations) {
      const query = Order.findOne(params)
      relations.forEach((relation) => query.populate(relation))

      return await query
    } else {
      return await Order.findOne(params)
    }
  }
}

module.exports = { OrderRepositoryDatabase }
