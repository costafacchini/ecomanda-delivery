const UPDATE_CONTACT_FIELDS = ['name', 'number', 'type', 'talkingWithChatBot', 'waId', 'landbotId', 'email']

function pickFields(fields: Record<string, any> = {}, keys: any[] = []) {
  return keys.reduce((payload: Record<string, any>, key: any) => {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      payload[key] = fields[key]
    }

    return payload
  }, {})
}

class UpdateContact {
  contactRepository: any

  constructor({ contactRepository }: Record<string, any> = {}) {
    this.contactRepository = contactRepository
  }

  async execute(id: any, fields = {}) {
    const payload = pickFields(fields, UPDATE_CONTACT_FIELDS)

    await this.contactRepository.update(id, payload)

    return await this.contactRepository.findFirst({ _id: id })
  }
}

export { UpdateContact, UPDATE_CONTACT_FIELDS }
