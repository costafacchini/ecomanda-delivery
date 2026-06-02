const CREATE_CONTACT_FIELDS = ['name', 'number', 'type', 'talkingWithChatBot', 'licensee', 'waId', 'landbotId', 'email']

function pickFields(fields: Record<string, any> = {}, keys: any[] = []) {
  return keys.reduce((payload: Record<string, any>, key: any) => {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      payload[key] = fields[key]
    }

    return payload
  }, {})
}

class CreateContact {
  contactRepository: any

  constructor({ contactRepository }: Record<string, any> = {}) {
    this.contactRepository = contactRepository
  }

  async execute(fields = {}) {
    const payload = pickFields(fields, CREATE_CONTACT_FIELDS)
    return await this.contactRepository.create(payload)
  }
}

export { CreateContact, CREATE_CONTACT_FIELDS }
