import { MessagesSendedQuery } from '@queries/MessagesSended'
import { MessagesFailedQuery } from '@queries/MessagesFailed'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import moment from 'moment'

class MessagesSendedYesterday {
  constructor() {
    const yesterday = moment().subtract(1, 'days')
    this.startDate = moment(yesterday).startOf('day')
    this.endDate = moment(yesterday).endOf('day')
  }

  async report() {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensees = await licenseeRepository.find({ licenseKind: 'paid' })

    const licenseeMessages = []

    for (const licensee of licensees) {
      const messagesSendedQuery = new MessagesSendedQuery(this.startDate, this.endDate, licensee._id)
      const messagesSuccess = await messagesSendedQuery.all()

      const messagesFaliedQuery = new MessagesFailedQuery(this.startDate, this.endDate, licensee._id)
      const messagesFailed = await messagesFaliedQuery.all()

      const record = {
        licensee: licensee,
        success: {
          count: messagesSuccess.length,
          messages: messagesSuccess,
        },
        error: {
          count: messagesFailed.length,
          messages: messagesFailed,
        },
      }

      licenseeMessages.push(record)
    }

    return licenseeMessages
  }
}

export { MessagesSendedYesterday }
