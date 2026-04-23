import mongoose from 'mongoose'

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

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isObjectIdLike(value) {
  return value instanceof mongoose.Types.ObjectId || value?._bsontype === 'ObjectId'
}

function comparableValue(value) {
  if (value instanceof Date) {
    return value.getTime()
  }

  if (isObjectIdLike(value)) {
    return value.toString()
  }

  if (isObject(value) && '_id' in value && value._id != null) {
    return comparableValue(value._id)
  }

  return value
}

function isOperatorObject(value) {
  return isObject(value) && Object.keys(value).some((key) => key.startsWith('$'))
}

function matchOperator(actual, operator, expected) {
  const comparableActual = comparableValue(actual)

  switch (operator) {
    case '$ne':
      return comparableActual !== comparableValue(expected)
    case '$gte':
      return comparableActual >= comparableValue(expected)
    case '$lte':
      return comparableActual <= comparableValue(expected)
    case '$in':
      return (expected ?? []).some((item) => comparableActual === comparableValue(item))
    case '$nin':
      return !(expected ?? []).some((item) => comparableActual === comparableValue(item))
    default:
      return false
  }
}

function matchValue(actual, expected) {
  if (isOperatorObject(expected)) {
    return Object.entries(expected).every(([operator, value]) => matchOperator(actual, operator, value))
  }

  if (isObject(expected) && !(expected instanceof Date) && !isObjectIdLike(expected) && !('_id' in expected)) {
    return Object.entries(expected).every(([key, value]) => matchValue(actual?.[key], value))
  }

  return comparableValue(actual) === comparableValue(expected)
}

function matchesFilter(record, params = {}) {
  if (!isObject(params) || isObjectIdLike(params)) {
    return matchValue(record?._id, params)
  }

  return Object.entries(params ?? {}).every(([key, expected]) => {
    if (key === '$or') {
      return (expected ?? []).some((filter) => matchesFilter(record, filter))
    }

    if (key === '$and') {
      return (expected ?? []).every((filter) => matchesFilter(record, filter))
    }

    return matchValue(record?.[key], expected)
  })
}

function sortRecords(records = [], order = {}) {
  const orderEntries = Object.entries(order ?? {})

  if (orderEntries.length === 0) {
    return [...records]
  }

  return [...records].sort((left, right) => {
    for (const [field, direction] of orderEntries) {
      const leftValue = comparableValue(left?.[field])
      const rightValue = comparableValue(right?.[field])

      if (leftValue === rightValue) {
        continue
      }

      const factor = direction === 'desc' || direction === -1 ? -1 : 1
      return leftValue > rightValue ? factor : -factor
    }

    return 0
  })
}

function buildMemoryRecord(fields = {}) {
  const now = new Date()
  const record = {
    _id: fields?._id ?? new mongoose.Types.ObjectId(),
    ...(fields ?? {}),
  }

  if (!('createdAt' in record)) {
    record.createdAt = now
  }

  if (!('updatedAt' in record)) {
    record.updatedAt = now
  }

  return record
}

class RepositoryMemory extends Repository {
  constructor(items = []) {
    super()
    this.items = items
  }

  async findFirst(params = {}, _relations = []) {
    return (await this.find(params))[0] ?? null
  }

  async create(fields = {}) {
    const record = buildMemoryRecord(fields)
    this.items.push(record)

    return await Promise.resolve(record)
  }

  async update(id, fields = {}) {
    const record = this.items.find((item) => matchValue(item?._id, id))

    if (record) {
      Object.assign(record, fields ?? {}, { updatedAt: new Date() })
    }

    return await Promise.resolve({ acknowledged: true })
  }

  async updateMany(params = {}, fields = {}) {
    this.items
      .filter((item) => matchesFilter(item, params ?? {}))
      .forEach((item) => Object.assign(item, fields ?? {}, { updatedAt: new Date() }))

    return await Promise.resolve({ acknowledged: true })
  }

  async find(params = {}) {
    return await Promise.resolve(this.items.filter((item) => matchesFilter(item, params ?? {})))
  }

  async delete(params = {}) {
    const index = this.items.findIndex((item) => matchesFilter(item, params ?? {}))

    if (index >= 0) {
      this.items.splice(index, 1)
    }

    return await Promise.resolve({ acknowledged: true })
  }

  async save(document) {
    document.updatedAt = new Date()

    const index = this.items.findIndex((item) => matchValue(item?._id, document._id))

    if (index >= 0) {
      this.items[index] = document
    } else {
      if (!document._id) {
        document._id = new mongoose.Types.ObjectId()
      }
      this.items.push(document)
    }

    return await Promise.resolve(document)
  }
}

export default Repository
export { RepositoryMemory, buildMemoryRecord, comparableValue, matchesFilter, sortRecords }
