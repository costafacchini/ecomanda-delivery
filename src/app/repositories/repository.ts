import mongoose from 'mongoose'

class Repository {
  model(): any {}

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

function normalizeExpectedValue(actual, expected) {
  if (typeof actual === 'boolean' && typeof expected === 'string') {
    const normalized = expected.toLowerCase()

    if (normalized === 'true') {
      return true
    }

    if (normalized === 'false') {
      return false
    }
  }

  return expected
}

function matchOperator(actual, operator, expected) {
  const comparableActual = comparableValue(actual)
  const normalizedExpected = normalizeExpectedValue(actual, expected)

  switch (operator) {
    case '$ne':
      if (normalizedExpected === null) {
        return actual !== null && actual !== undefined
      }

      return comparableActual !== comparableValue(normalizedExpected)
    case '$gt':
      return comparableActual > comparableValue(normalizedExpected)
    case '$gte':
      return comparableActual >= comparableValue(normalizedExpected)
    case '$lt':
      return comparableActual < comparableValue(normalizedExpected)
    case '$lte':
      return comparableActual <= comparableValue(normalizedExpected)
    case '$in':
      return (normalizedExpected ?? []).some((item) => comparableActual === comparableValue(item))
    case '$nin':
      return !(normalizedExpected ?? []).some((item) => comparableActual === comparableValue(item))
    default:
      return false
  }
}

function matchValue(actual, expected) {
  if (expected instanceof RegExp) {
    return expected.test(`${actual ?? ''}`)
  }

  if (isOperatorObject(expected)) {
    return Object.entries(expected).every(([operator, value]) => matchOperator(actual, operator, value))
  }

  if (isObject(expected) && !(expected instanceof Date) && !isObjectIdLike(expected) && !('_id' in expected)) {
    return Object.entries(expected).every(([key, value]) => matchValue(actual?.[key], value))
  }

  const normalizedExpected = normalizeExpectedValue(actual, expected)
  return comparableValue(actual) === comparableValue(normalizedExpected)
}

function matchesFilter(record, params = {}) {
  if (!isObject(params) || isObjectIdLike(params)) {
    return matchValue(record?._id, params)
  }

  return Object.entries(params ?? {}).every(([key, expected]) => {
    if (key === '$or') {
      return (expected as any[] ?? []).some((filter) => matchesFilter(record, filter))
    }

    if (key === '$and') {
      return (expected as any[] ?? []).every((filter) => matchesFilter(record, filter))
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

function buildMemoryRecord(fields: Record<string, any> = {}) {
  const now = new Date()
  const record: Record<string, any> = {
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
  items: any[]
  modelClass: any
  relationLoaders: Record<string, any>

  constructor(items = []) {
    super()
    this.items = items
    this.modelClass = null
    this.relationLoaders = {}
  }

  hydrate(record) {
    if (!record || typeof record !== 'object') {
      return record
    }

    Object.defineProperty(record, 'save', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: async () => await this.save(record),
    })

    return record
  }

  async findFirst(params = {}, relations = []) {
    return (await this.find(params, relations))[0] ?? null
  }

  async create(fields = {}) {
    const record = this.prepareRecord(fields)
    this.items.push(record)

    return await Promise.resolve(this.hydrate(record))
  }

  async update(id, fields = {}) {
    const record = this.items.find((item) => matchValue(item?._id, id))

    if (record) {
      const nextRecord = this.prepareRecord({ ...record, ...(fields ?? {}) }, { existingRecord: record })
      Object.assign(record, nextRecord)
    }

    return await Promise.resolve({ acknowledged: true })
  }

  async updateMany(params = {}, fields = {}) {
    this.items
      .filter((item) => matchesFilter(item, params ?? {}))
      .forEach((item) => {
        const nextRecord = this.prepareRecord({ ...item, ...(fields ?? {}) }, { existingRecord: item })
        Object.assign(item, nextRecord)
      })

    return await Promise.resolve({ acknowledged: true })
  }

  async find(params = {}, relations = []) {
    this.assertValidParams(params)

    const records = this.items.filter((item) => matchesFilter(item, params ?? {}))
    const populatedRecords = await this.populateRecords(records, relations)

    return await Promise.resolve(populatedRecords.map((item) => this.hydrate(item)))
  }

  async delete(params = {}) {
    const index = this.items.findIndex((item) => matchesFilter(item, params ?? {}))

    if (index >= 0) {
      this.items.splice(index, 1)
    }

    return await Promise.resolve({ acknowledged: true })
  }

  async save(document) {
    const existingRecord = this.items.find((item) => matchValue(item?._id, document?._id))
    const storedRecord = this.prepareRecord(document, { existingRecord })
    const index = this.items.findIndex((item) => matchValue(item?._id, storedRecord._id))

    if (index >= 0) {
      this.items[index] = storedRecord
    } else {
      this.items.push(storedRecord)
    }

    return await Promise.resolve(this.hydrate(storedRecord))
  }

  prepareRecord(fields = {}, { existingRecord = null } = {}) {
    if (!this.modelClass) {
      if (existingRecord) {
        return {
          ...existingRecord,
          ...(fields ?? {}),
          createdAt: existingRecord.createdAt,
          updatedAt: new Date(),
        }
      }

      return buildMemoryRecord(fields)
    }

    const payload = this.serializeInput(fields)
    const now = new Date()
    const document = new this.modelClass({
      ...(payload ?? {}),
      _id: payload?._id ?? existingRecord?._id ?? new mongoose.Types.ObjectId(),
      createdAt: payload?.createdAt ?? existingRecord?.createdAt ?? now,
      updatedAt: now,
    })
    const validationError = document.validateSync()

    if (validationError) {
      throw validationError
    }

    const record = this.serializeInput(document)
    record.createdAt = payload?.createdAt ?? existingRecord?.createdAt ?? record.createdAt ?? now
    record.updatedAt = now

    return record
  }

  serializeInput(value) {
    if (value?.toObject) {
      return value.toObject({ depopulate: true, versionKey: false, virtuals: false })
    }

    return { ...(value ?? {}) }
  }

  async populateRecords(records = [], relations = []) {
    if (!relations || relations.length === 0) {
      return records
    }

    const populatedRecords = []

    for (const record of records) {
      const clone = this.serializeInput(record)

      for (const relation of relations) {
        await this.populateRelation(clone, relation)
      }

      populatedRecords.push(clone)
    }

    return populatedRecords
  }

  async populateRelation(record, relation) {
    const relationLoader = this.relationLoaders?.[relation]

    if (!relationLoader) {
      return
    }

    const segments = relation.split('.')
    await this.populateRelationPath(record, segments, relationLoader)
  }

  async populateRelationPath(target, segments, relationLoader) {
    const [segment, ...rest] = segments

    if (!target || !(segment in target)) {
      return
    }

    if (rest.length === 0) {
      if (Array.isArray(target[segment])) {
        target[segment] = await Promise.all(target[segment].map((value) => relationLoader(value)))
      } else {
        target[segment] = await relationLoader(target[segment])
      }

      return
    }

    if (Array.isArray(target[segment])) {
      await Promise.all(target[segment].map((item) => this.populateRelationPath(item, rest, relationLoader)))
      return
    }

    await this.populateRelationPath(target[segment], rest, relationLoader)
  }

  assertValidParams(params = {}) {
    if (!this.modelClass || !params || typeof params !== 'object' || Array.isArray(params)) {
      return
    }

    Object.entries(params).forEach(([key, value]) => {
      if (key === '$or' || key === '$and') {
        ;(value ?? []).forEach((filter) => this.assertValidParams(filter))
        return
      }

      const schemaPath = this.modelClass.schema?.path(key)

      if (!schemaPath || schemaPath.instance !== 'ObjectId') {
        return
      }

      this.assertValidObjectIdValue(key, value)
    })
  }

  assertValidObjectIdValue(path, value) {
    if (value == null || value instanceof RegExp) {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => this.assertValidObjectIdValue(path, item))
      return
    }

    if (isOperatorObject(value)) {
      Object.values(value).forEach((item) => this.assertValidObjectIdValue(path, item))
      return
    }

    const comparable = comparableValue(value)

    if (typeof comparable === 'string' && !mongoose.isValidObjectId(comparable)) {
      throw new mongoose.Error.CastError('ObjectId', comparable, path)
    }
  }
}

export default Repository
export { RepositoryMemory, buildMemoryRecord, comparableValue, matchesFilter, sortRecords }
