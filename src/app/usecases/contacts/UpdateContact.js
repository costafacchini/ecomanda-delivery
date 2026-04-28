const UPDATE_CONTACT_FIELDS = [
  'name',
  'number',
  'type',
  'talkingWithChatBot',
  'waId',
  'landbotId',
  'email',
  'address',
  'address_number',
  'address_complement',
  'neighborhood',
  'city',
  'cep',
  'uf',
  'delivery_tax',
  'plugin_cart_id',
]

const SEND_CONTACT_TO_PAGARME_JOB = 'send-contact-to-pagarme'

function pickFields(fields = {}, keys = []) {
  return keys.reduce((payload, key) => {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      payload[key] = fields[key]
    }

    return payload
  }, {})
}

class UpdateContact {
  constructor({ contactRepository, jobQueue } = {}) {
    this.contactRepository = contactRepository
    this.jobQueue = jobQueue
  }

  async execute(id, fields = {}) {
    const payload = pickFields(fields, UPDATE_CONTACT_FIELDS)

    await this.contactRepository.update(id, payload)

    const contact = await this.contactRepository.findFirst({ _id: id })

    await this.jobQueue.addJob(SEND_CONTACT_TO_PAGARME_JOB, { contactId: contact._id.toString() })

    return contact
  }
}

export { UpdateContact, SEND_CONTACT_TO_PAGARME_JOB, UPDATE_CONTACT_FIELDS }
