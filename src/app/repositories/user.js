import bcrypt from 'bcrypt'
import Repository, { RepositoryMemory } from './repository.js'
import User from '../models/User.js'

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
  async create(fields = {}) {
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
    if (document.password && !document.password.startsWith('$2')) {
      document.password = await bcrypt.hash(document.password, saltRounds)
    }

    const saved = await super.save(document)
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
}

export { UserRepositoryDatabase, UserRepositoryMemory }
