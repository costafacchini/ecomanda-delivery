import Repository, { RepositoryMemory } from './repository'
import Licensee from '../models/Licensee'

class LicenseeRepositoryDatabase extends Repository {
  model() {
    return Licensee
  }

  async findFirst(params: any = {}) {
    return await Licensee.findOne(params)
  }

  async create(fields: any = {}) {
    return await Licensee.create({ ...fields })
  }

  async update(id: any, fields: any = {}) {
    return await Licensee.updateOne({ _id: id }, { $set: fields }, { runValidators: true })
  }

  async find(params: any = {}) {
    return await Licensee.find(params)
  }
}

class LicenseeRepositoryMemory extends RepositoryMemory {
  async create(fields: any = {}) {
    return await super.create(this.normalizeLicenseeFields(fields))
  }

  async save(document: any) {
    Object.assign(document, this.normalizeLicenseeFields(document))
    return await super.save(document)
  }

  normalizeLicenseeFields(fields: Record<string, any> = {}) {
    const normalizedFields: Record<string, any> = { ...(fields ?? {}) }
    const stringFields = ['apiToken']

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
