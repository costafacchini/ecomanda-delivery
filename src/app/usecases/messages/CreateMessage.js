const CREATE_MESSAGE_FIELDS = [
  'licensee',
  'contact',
  'phone',
  'kind',
  'destination',
  'text',
  'url',
  'fileName',
  'latitude',
  'longitude',
  'fromMe',
  'senderName',
  'departament',
]

const SEND_MESSAGE_TO_MESSENGER_JOB = 'send-message-to-messenger'

function pickFields(fields = {}, keys = []) {
  return keys.reduce((payload, key) => {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      payload[key] = fields[key]
    }
    return payload
  }, {})
}

class CreateMessage {
  constructor({ messageRepository, contactRepository, jobQueue } = {}) {
    this.messageRepository = messageRepository
    this.contactRepository = contactRepository
    this.jobQueue = jobQueue
  }

  async execute(fields = {}) {
    const payload = pickFields(fields, CREATE_MESSAGE_FIELDS)

    if (!payload.licensee) {
      throw new Error('licensee is required')
    }

    if (payload.phone && !payload.contact) {
      const contact = await this.contactRepository.getContactByNumber(payload.phone, payload.licensee)
      if (!contact) {
        throw new Error(`Contact not found for phone ${payload.phone}`)
      }
      payload.contact = contact._id
    }

    delete payload.phone

    const message = await this.messageRepository.create(payload)

    if (message.destination === 'to-messenger') {
      await this.jobQueue.addJob(SEND_MESSAGE_TO_MESSENGER_JOB, { messageId: message._id })
    }

    return message
  }
}

export { CreateMessage, CREATE_MESSAGE_FIELDS }
