import Repository, { RepositoryMemory } from './repository'
import Order from '../models/Order'

class OrderRepositoryDatabase extends Repository {
  model() {
    return Order
  }
}

class OrderRepositoryMemory extends RepositoryMemory {}

export { OrderRepositoryDatabase, OrderRepositoryMemory }
