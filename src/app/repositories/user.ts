import bcrypt from 'bcrypt'
import Repository, { RepositoryMemory } from './repository'
import User from '../models/User'

const saltRounds = 14

class UserRepositoryDatabase extends Repository {
  model() {
    return User
  }

  async create(fields: any = {}) {
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

  async findFirst(params: any = {}, relations: any[] = []) {
    // Call RepositoryMemory.prototype.find directly to avoid the projection
    // collision in UserRepositoryMemory.find whose second param is `projection`, not `relations`.
    const records = await RepositoryMemory.prototype.find.call(this, params, relations)
    const record = (records[0] as any) ?? null
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

    return records.map((record: any) => {
      const projectedRecord: Record<string, any> = { _id: record._id }
      includedFields.forEach((field: any) => {
        projectedRecord[field] = record[field]
      })
      return projectedRecord
    })
  }

  async save(document: any) {
    const payload = document?.toObject ? document.toObject() : { ...(document ?? {}) }

    if (payload.password && !payload.password.startsWith('$2')) {
      this.validateUserFields(payload)
      payload.password = await bcrypt.hash(payload.password, saltRounds)
    }

    const saved = await super.save(payload)
    return this.attachValidPassword(saved)
  }

  attachValidPassword(record: any) {
    if (record.validPassword) {
      return record
    }

    record.validPassword = async function (password: any) {
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
