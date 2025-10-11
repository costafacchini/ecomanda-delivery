import Repository from './repository'
import Licensee from '@models/Licensee'

class LicenseeRepositoryDatabase extends Repository {
  model() {
    return Licensee
  }

  async findFirst(params) {
    return await Licensee.findOne(params)
  }

  async create(fields) {
    return await Licensee.create({ ...fields })
  }

  async update(id, fields) {
    return await Licensee.updateOne({ _id: id }, { $set: fields }, { runValidators: true })
  }

  async find(params) {
    return await Licensee.find(params)
  }
}

export { LicenseeRepositoryDatabase }
