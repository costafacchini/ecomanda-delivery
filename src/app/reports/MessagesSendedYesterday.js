const Licensee = require('@models/Licensee')
const MessagesSendedQuery = require('@queries/MessagesSended')
const MessagesFailedQuery = require('@queries/MessagesFailed')
const moment = require('moment')

class MessagesSendedYesterday {
  constructor() {
    const yesterday = moment().subtract(1, 'days')
    this.startDate = moment(yesterday).startOf('day')
    this.endDate = moment(yesterday).endOf('day')
  }

  async report() {
    const licensees = await Licensee.find({ licenseKind: 'paid' })

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

module.exports = MessagesSendedYesterday
