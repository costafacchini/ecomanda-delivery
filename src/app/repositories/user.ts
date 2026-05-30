import bcrypt from 'bcrypt'
import Repository, { RepositoryMemory } from './repository'
import User from '../models/User'

const saltRounds = 14

class UserRepositoryDatabase extends Repository {
  model() {
    return User
  }

  async create(fields = {}) {
    const user = new User({ ...(fields ?? {}) })

    return await this.save(user)
  }

  async find(params = {}, projection = {}) {
    return await User.find(params ?? {}, projection ?? {})
  }
}

class UserRepositoryMemory extends RepositoryMemory {
  async create(fields: Record<string, any> = {}) {
    this.validateUserFields(fields)

    const record = await super.create({
      ...(fields ?? {}),
      password: await bcrypt.hash(fields?.password ?? '', saltRounds),
    })

    return this.attachValidPassword(record)
  }

  async findFirst(params = {}, relations = []) {
    const record = await super.findFirst(params, relations)
    return record ? this.attachValidPassword(record) : null
  }

  async find(params = {}, projection = {}) {
    const records = (await super.find(params)).map((record) => this.attachValidPassword(record))

    if (!projection || Object.keys(projection).length === 0) {
      return records
    }

    const excludedFields = Object.entries(projection)
      .filter(([, value]) => value === 0)
      .map(([field]) => field)

    if (excludedFields.length > 0) {
      return records.map((record) => {
        const projectedRecord = { ...record }
        excludedFields.forEach((field) => delete projectedRecord[field])
        return projectedRecord
      })
    }

    const includedFields = Object.entries(projection)
      .filter(([, value]) => value === 1)
      .map(([field]) => field)

    return records.map((record) => {
      const projectedRecord = { _id: record._id }
      includedFields.forEach((field) => {
        projectedRecord[field] = record[field]
      })
      return projectedRecord
    })
  }

  async save(document) {
    const payload = document?.toObject ? document.toObject() : { ...(document ?? {}) }

    if (payload.password && !payload.password.startsWith('$2')) {
      this.validateUserFields(payload)
      payload.password = await bcrypt.hash(payload.password, saltRounds)
    }

    const saved = await super.save(payload)
    return this.attachValidPassword(saved)
  }

  attachValidPassword(record) {
    if (record.validPassword) {
      return record
    }

    record.validPassword = async function (password) {
      return await bcrypt.compare(password, this.password)
    }

    return record
  }

  validateUserFields(fields = {}) {
    const error = new User({ ...(fields ?? {}) }).validateSync()

    if (error) {
      throw error
    }
  }
}

export { UserRepositoryDatabase, UserRepositoryMemory }
