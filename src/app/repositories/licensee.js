import Repository, { RepositoryMemory } from './repository.js'
import Licensee from '../models/Licensee.js'

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

class LicenseeRepositoryMemory extends RepositoryMemory {
  async create(fields = {}) {
    return await super.create(this.normalizeLicenseeFields(fields))
  }

  async save(document) {
    Object.assign(document, this.normalizeLicenseeFields(document))
    return await super.save(document)
  }

  normalizeLicenseeFields(fields = {}) {
    const normalizedFields = { ...(fields ?? {}) }
    const stringFields = ['apiToken', 'recipient_id']

    stringFields.forEach((field) => {
      if (normalizedFields[field] != null) {
        normalizedFields[field] = `${normalizedFields[field]}`
      }
    })

    if (normalizedFields.whatsappDefault === 'utalk') {
      normalizedFields.whatsappUrl = 'https://v1.utalk.chat/send/'
    }

    if (normalizedFields.whatsappDefault === 'dialog') {
      normalizedFields.whatsappUrl = 'https://waba.360dialog.io/'
    }

    if (normalizedFields.whatsappDefault === 'ycloud') {
      normalizedFields.whatsappUrl = 'https://api.ycloud.com/v2/'
    }

    return normalizedFields
  }
}

export { LicenseeRepositoryDatabase, LicenseeRepositoryMemory }
