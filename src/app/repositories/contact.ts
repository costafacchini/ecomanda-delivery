import Repository, { RepositoryMemory, comparableValue, sortRecords } from './repository'
import Contact from '../models/Contact'
import { MessagesQuery } from '../queries/MessagesQuery'
import moment from 'moment-timezone'
import { NormalizePhone } from '../helpers/NormalizePhone'
import { requireDependency } from '../helpers/RequireDependency'
import { IContact } from '../../types'

class ContactRepositoryDatabase extends Repository<IContact> {
  messageRepository: any

  constructor({ messageRepository }: { messageRepository?: any } = {}) {
    super()
    this.messageRepository = messageRepository
  }

  model() {
    return Contact
  }

  async contactWithWhatsappWindowClosed(contactId: any) {
    const messageRepository = requireDependency(
      this.messageRepository,
      'messageRepository',
      'ContactRepositoryDatabase',
    )
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

  async getContactByNumber(number: any, licenseeId: any) {
    const normalizedPhone = new NormalizePhone(number)
    return await this.findFirst({
      number: normalizedPhone.number,
      licensee: licenseeId,
      type: normalizedPhone.type,
    })
  }

  async deactivateGroupsForLicensee(licenseeId: any) {
    return await this.updateMany({ licensee: licenseeId, isGroup: true }, { active: false })
  }
}

class ContactRepositoryMemory extends RepositoryMemory<IContact> {
  messageRepository: any

  constructor({ items = [], messageRepository }: { items?: any[]; messageRepository?: any } = {}) {
    super(items)
    this.messageRepository = messageRepository
  }

  async create(fields: Partial<IContact> = {}): Promise<IContact> {
    return await super.create(this.normalizeContactFields(fields))
  }

  async contactWithWhatsappWindowClosed(contactId: any) {
    const messageRepository = requireDependency(this.messageRepository, 'messageRepository', 'ContactRepositoryMemory')
    const messages = sortRecords(await messageRepository.find({ destination: 'to-chat' }), {
      createdAt: 'desc',
    }).filter((message: any) => comparableValue(message.contact) === comparableValue(contactId))

    if (messages.length === 0) {
      return true
    }

    const now = moment.tz(new Date(), 'America/Sao_Paulo')
    const diff = now.diff(moment.tz(messages[0].createdAt, 'America/Sao_Paulo'), 'minutes')
    const twentyFourhoursInMinutes = 24 * 60

    return diff >= twentyFourhoursInMinutes
  }

  async getContactByNumber(number: any, licenseeId: any) {
    const normalizedPhone = new NormalizePhone(number)
    return await this.findFirst({
      number: normalizedPhone.number,
      licensee: licenseeId,
      type: normalizedPhone.type,
    })
  }

  async deactivateGroupsForLicensee(licenseeId: any) {
    return await this.updateMany({ licensee: licenseeId, isGroup: true }, { active: false })
  }

  async save(document: any) {
    Object.assign(document, this.normalizeContactFields(document))
    return await super.save(document)
  }

  normalizeContactFields(fields: Record<string, any> = {}) {
    const normalizedFields: Record<string, any> = { ...(fields ?? {}) }
    const stringFields = ['landbotId', 'chatwootId', 'chatwootSourceId', 'customer_id', 'credit_card_id']

    if (!Array.isArray(normalizedFields.credit_cards)) {
      normalizedFields.credit_cards = []
    }

    stringFields.forEach((field) => {
      if (normalizedFields[field] != null) {
        normalizedFields[field] = `${normalizedFields[field]}`
      }
    })

    if (normalizedFields.number?.includes('@') || !normalizedFields.type) {
      const normalizedPhone = new NormalizePhone(normalizedFields.number)
      normalizedFields.number = normalizedPhone.number
      normalizedFields.type = normalizedPhone.type
    }

    return normalizedFields
  }
}

export { ContactRepositoryDatabase, ContactRepositoryMemory }
