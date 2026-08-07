import { IRepository } from '@repositories/repository'
import { IContact } from '../../../types'

const CREATE_CONTACT_FIELDS = ['name', 'number', 'type', 'talkingWithChatBot', 'licensee', 'waId', 'landbotId', 'email']

interface CreateContactDeps {
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

class CreateContact {
  contactRepository: IRepository<IContact>

  constructor({ contactRepository }: CreateContactDeps) {
    this.contactRepository = contactRepository
  }

  async execute(fields: Record<string, any> = {}): Promise<IContact> {
    const payload = pickFields(fields, CREATE_CONTACT_FIELDS)
    return await this.contactRepository.create(payload)
  }
}

export { CreateContact, CREATE_CONTACT_FIELDS }
