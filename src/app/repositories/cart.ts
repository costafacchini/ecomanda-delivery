import Repository, { RepositoryMemory, matchesFilter } from './repository'
import Cart from '../models/Cart'

class CartRepositoryDatabase extends Repository {
  model() {
    return Cart
  }

  async create(fields: any = {}) {
    return await Cart.create({ ...fields })
  }

  async update(id: any, fields: any = {}) {
    return await Cart.updateOne({ _id: id }, { $set: fields }, { runValidators: true })
  }

  async findFirst(params: any = {}, relations: any[] = []) {
    if (relations) {
      const query = Cart.findOne(params)
      relations.forEach((relation: any) => query.populate(relation))

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
  hydrate(record: any) {
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

  async create(fields: any = {}) {
    return await super.create(this.normalizeCartFields(fields))
  }

  async save(document: any) {
    Object.assign(document, this.normalizeCartFields(document))
    return await super.save(document)
  }

  async delete(params: any = {}) {
    const recordsToKeep = this.items.filter((item) => !matchesFilter(item, params ?? {}))
    this.items.splice(0, this.items.length, ...recordsToKeep)

    return await Promise.resolve({ acknowledged: true })
  }

  normalizeCartFields(fields: any = {}) {
    const normalizedFields = {
      products: [] as any[],
      concluded: false,
      ...(fields ?? {}),
    }

    normalizedFields.products = (normalizedFields.products ?? []).map((product: any) => ({
      additionals: [],
      ...(product ?? {}),
    }))

    const cart = this.hydrate(normalizedFields)
    cart.total = cart.calculateTotal()

    return cart
  }
}

export { CartRepositoryDatabase, CartRepositoryMemory }
