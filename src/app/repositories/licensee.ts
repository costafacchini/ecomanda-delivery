import Repository, { RepositoryMemory } from './repository'
import Licensee from '../models/Licensee'
import { ILicensee } from '../../types'

class LicenseeRepositoryDatabase extends Repository<ILicensee> {
  model() {
    return Licensee
  }
}

class LicenseeRepositoryMemory extends RepositoryMemory<ILicensee> {
  async create(fields: Partial<ILicensee> = {}): Promise<ILicensee> {
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
