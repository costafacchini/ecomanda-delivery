import { MessagesSendedQuery } from '@queries/MessagesSended'
import { MessagesFailedQuery } from '@queries/MessagesFailed'
import moment from 'moment'

class MessagesSendedYesterday {
  constructor({ licenseeRepository, messageRepository } = {}) {
    const yesterday = moment().subtract(1, 'days')
    this.startDate = moment(yesterday).startOf('day')
    this.endDate = moment(yesterday).endOf('day')
    this.licenseeRepository = licenseeRepository
    this.messageRepository = messageRepository
  }

  async report() {
    const licensees = await this.licenseeRepository.find({ licenseKind: 'paid' })

    const licenseeMessages = []

    for (const licensee of licensees) {
      const messagesSendedQuery = new MessagesSendedQuery(this.startDate, this.endDate, licensee._id, {
        messageRepository: this.messageRepository,
      })
      const messagesSuccess = await messagesSendedQuery.all()

      const messagesFaliedQuery = new MessagesFailedQuery(this.startDate, this.endDate, licensee._id, {
        messageRepository: this.messageRepository,
      })
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
