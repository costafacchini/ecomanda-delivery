import { IRepository } from '@repositories/repository'
import { IContact } from '../../../types'

const UPDATE_CONTACT_FIELDS = ['name', 'number', 'type', 'talkingWithChatBot', 'waId', 'landbotId', 'email']

interface UpdateContactDeps {
  contactRepository: IRepository<IContact>
}

function pickFields(fields: Record<string, any> = {}, keys: string[] = []) {
  return keys.reduce((payload: Record<string, any>, key: string) => {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      payload[key] = fields[key]
    }

    return payload
  }, {})
}

class UpdateContact {
  contactRepository: IRepository<IContact>

  constructor({ contactRepository }: UpdateContactDeps) {
    this.contactRepository = contactRepository
  }

  async execute(id: string, fields: Record<string, any> = {}): Promise<IContact | null> {
    const payload = pickFields(fields, UPDATE_CONTACT_FIELDS)

    await this.contactRepository.update(id, payload)

    return await this.contactRepository.findFirst({ _id: id })
  }
}

export { UpdateContact, UPDATE_CONTACT_FIELDS }
