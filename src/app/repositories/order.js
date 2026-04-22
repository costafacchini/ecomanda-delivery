import Repository from './repository.js'
import Order from '../models/Order.js'

class OrderRepositoryDatabase extends Repository {
  model() {
    return Order
  }
}

export { OrderRepositoryDatabase }
