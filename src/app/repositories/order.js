import Repository from './repository.js'
import Order from '../models/Order.js'

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

export { OrderRepositoryDatabase }
