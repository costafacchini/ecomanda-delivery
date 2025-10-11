import Repository from './repository'
import Contact from '@models/Contact'
import MessagesQuery from '@queries/MessagesQuery'
import moment from 'moment-timezone'
import NormalizePhone from '@helpers/NormalizePhone'

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
    const messagesQuery = new MessagesQuery()

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

export { ContactRepositoryDatabase }
