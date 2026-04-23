import Repository, { RepositoryMemory, comparableValue, sortRecords } from './repository.js'
import Contact from '../models/Contact.js'
import { MessagesQuery } from '../queries/MessagesQuery.js'
import { MessageRepositoryDatabase, MessageRepositoryMemory } from './message.js'
import moment from 'moment-timezone'
import { NormalizePhone } from '../helpers/NormalizePhone.js'

class ContactRepositoryDatabase extends Repository {
  model() {
    return Contact
  }

  async findFirst(params, relations) {
    if (relations) {
      const query = Contact.findOne(params)
      relations.forEach((relation) => query.populate(relation))

      return await query
    } else {
      return await Contact.findOne(params)
    }
  }

  async create(fields) {
    return await Contact.create({ ...fields })
  }

  async update(id, fields) {
    return await Contact.updateOne({ _id: id }, { $set: fields }, { runValidators: true })
  }

  async find(params) {
    return await Contact.find(params)
  }

  async contactWithWhatsappWindowClosed(contactId) {
    const messageRepository = new MessageRepositoryDatabase()
    const messagesQuery = new MessagesQuery({ messageRepository })

    messagesQuery.page(1)
    messagesQuery.limit(1)
    messagesQuery.filterByDestination('to-chat')
    messagesQuery.filterByContact(contactId)
    const messages = await messagesQuery.all()

    if (messages.length === 0) return true

    const now = moment.tz(new Date(), 'America/Sao_Paulo')
    const diff = now.diff(moment.tz(messages[0].createdAt, 'America/Sao_Paulo'), 'minutes')
    const twentyFourhoursInMinutes = 24 * 60

    return diff >= twentyFourhoursInMinutes
  }

  async getContactByNumber(number, licenseeId) {
    const normalizedPhone = new NormalizePhone(number)
    return await this.findFirst({
      number: normalizedPhone.number,
      licensee: licenseeId,
      type: normalizedPhone.type,
    })
  }
}

class ContactRepositoryMemory extends RepositoryMemory {
  constructor({ items = [], messageRepository = new MessageRepositoryMemory() } = {}) {
    super(items)
    this.messageRepository = messageRepository
  }

  async create(fields = {}) {
    return await super.create(this.normalizeContactFields(fields))
  }

  async contactWithWhatsappWindowClosed(contactId) {
    const messages = sortRecords(await this.messageRepository.find({ destination: 'to-chat' }), {
      createdAt: 'desc',
    }).filter((message) => comparableValue(message.contact) === comparableValue(contactId))

    if (messages.length === 0) {
      return true
    }

    const now = moment.tz(new Date(), 'America/Sao_Paulo')
    const diff = now.diff(moment.tz(messages[0].createdAt, 'America/Sao_Paulo'), 'minutes')
    const twentyFourhoursInMinutes = 24 * 60

    return diff >= twentyFourhoursInMinutes
  }

  async getContactByNumber(number, licenseeId) {
    const normalizedPhone = new NormalizePhone(number)
    return await this.findFirst({
      number: normalizedPhone.number,
      licensee: licenseeId,
      type: normalizedPhone.type,
    })
  }

  async save(document) {
    Object.assign(document, this.normalizeContactFields(document))
    return await super.save(document)
  }

  normalizeContactFields(fields = {}) {
    const normalizedFields = { ...(fields ?? {}) }

    if (normalizedFields.number?.includes('@') || !normalizedFields.type) {
      const normalizedPhone = new NormalizePhone(normalizedFields.number)
      normalizedFields.number = normalizedPhone.number
      normalizedFields.type = normalizedPhone.type
    }

    if (normalizedFields.cep) {
      normalizedFields.cep = normalizedFields.cep.replace(/[^0-9]/g, '')
    }

    return normalizedFields
  }
}

export { ContactRepositoryDatabase, ContactRepositoryMemory }
