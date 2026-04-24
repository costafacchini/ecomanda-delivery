import Repository, { RepositoryMemory } from './repository.js'
import Order from '../models/Order.js'

class OrderRepositoryDatabase extends Repository {
  model() {
    return Order
  }
}

class OrderRepositoryMemory extends RepositoryMemory {}

export { OrderRepositoryDatabase, OrderRepositoryMemory }
