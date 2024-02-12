const Licensee = require('@models/Licensee')

class LicenseeRepository {
  model() {}
  async findFirst() {}
  async create() {}
  async update() {}
  async find() {}
}

class LicenseeRepositoryDatabase extends LicenseeRepository {
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

module.exports = { LicenseeRepository, LicenseeRepositoryDatabase }
