class Repository {
  model() {}

  async findFirst(params = {}, relations = []) {
    const query = this.model().findOne(params ?? {})

    relations.forEach((relation) => query.populate(relation))

    return await query
  }

  async create(fields = {}) {
    return await this.model().create({ ...(fields ?? {}) })
  }

  async update(id, fields = {}) {
    return await this.model().updateOne({ _id: id }, { $set: fields ?? {} }, { runValidators: true })
  }

  async updateMany(params = {}, fields = {}) {
    return await this.model().updateMany(params ?? {}, { $set: fields ?? {} }, { runValidators: true })
  }

  async find(params = {}) {
    return await this.model().find(params ?? {})
  }

  async delete(params = {}) {
    return await this.model().deleteOne(params ?? {})
  }

  async save(document) {
    return await document.save()
  }
}

export default Repository
