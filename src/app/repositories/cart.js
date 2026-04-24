import Repository, { RepositoryMemory, matchesFilter } from './repository.js'
import Cart from '../models/Cart.js'

class CartRepositoryDatabase extends Repository {
  model() {
    return Cart
  }

  async create(fields) {
    return await Cart.create({ ...fields })
  }

  async update(id, fields) {
    return await Cart.updateOne({ _id: id }, { $set: fields }, { runValidators: true })
  }

  async findFirst(params, relations) {
    if (relations) {
      const query = Cart.findOne(params)
      relations.forEach((relation) => query.populate(relation))

      return await query
    } else {
      return await Cart.findOne(params)
    }
  }

  async delete() {
    return await Cart.deleteMany()
  }
}

class CartRepositoryMemory extends RepositoryMemory {
  hydrate(record) {
    const hydratedRecord = super.hydrate(record)

    if (!hydratedRecord) {
      return hydratedRecord
    }

    if (typeof hydratedRecord.calculateTotal !== 'function') {
      Object.defineProperty(hydratedRecord, 'calculateTotal', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: Cart.prototype.calculateTotal,
      })
    }

    if (typeof hydratedRecord.calculateTotalItem !== 'function') {
      Object.defineProperty(hydratedRecord, 'calculateTotalItem', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: Cart.prototype.calculateTotalItem,
      })
    }

    return hydratedRecord
  }

  async create(fields = {}) {
    return await super.create(this.normalizeCartFields(fields))
  }

  async save(document) {
    Object.assign(document, this.normalizeCartFields(document))
    return await super.save(document)
  }

  async delete(params = {}) {
    const recordsToKeep = this.items.filter((item) => !matchesFilter(item, params ?? {}))
    this.items.splice(0, this.items.length, ...recordsToKeep)

    return await Promise.resolve({ acknowledged: true })
  }

  normalizeCartFields(fields = {}) {
    const normalizedFields = {
      products: [],
      concluded: false,
      ...(fields ?? {}),
    }

    normalizedFields.products = (normalizedFields.products ?? []).map((product) => ({
      additionals: [],
      ...(product ?? {}),
    }))

    const cart = this.hydrate(normalizedFields)
    cart.total = cart.calculateTotal()

    return cart
  }
}

export { CartRepositoryDatabase, CartRepositoryMemory }
