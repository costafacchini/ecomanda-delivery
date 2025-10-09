import Repository from './repository.js'
import Cart from '@models/Cart.js'

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

export default { CartRepositoryDatabase }
