const CREATE_CONTACT_FIELDS = [
  'name',
  'number',
  'type',
  'talkingWithChatBot',
  'licensee',
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

class CreateContact {
  constructor({ contactRepository, jobQueue } = {}) {
    this.contactRepository = contactRepository
    this.jobQueue = jobQueue
  }

  async execute(fields = {}) {
    const payload = pickFields(fields, CREATE_CONTACT_FIELDS)
    const contact = await this.contactRepository.create(payload)

    await this.jobQueue.addJob(SEND_CONTACT_TO_PAGARME_JOB, { contactId: contact._id.toString() })

    return contact
  }
}

export { CreateContact, CREATE_CONTACT_FIELDS, SEND_CONTACT_TO_PAGARME_JOB }
