const Licensee = require('@models/Licensee')
const MessagesQuery = require('@queries/MessagesQuery')
const moment = require('moment-timezone')

async function getLicenseeFirstMessage(licensee) {
  const messagesQuery = new MessagesQuery()
  messagesQuery.page(1)
  messagesQuery.limit(1)
  messagesQuery.filterByLicensee(licensee._id)
  messagesQuery.filterBySended(true)
  messagesQuery.sortBy('createdAt', 'asc')

  const records = await messagesQuery.all()
  return records[0]
}

async function getLicenseeLastMessage(licensee) {
  const messagesQuery = new MessagesQuery()
  messagesQuery.filterByLicensee(licensee._id)
  messagesQuery.filterBySended(true)
  messagesQuery.page(1)
  messagesQuery.limit(1)

  const records = await messagesQuery.all()
  return records[0]
}

async function getMessagesSummary(licensee) {
  const messagesSummary = [
    {
      month: moment.tz(this.reportDate, 'America/Sao_Paulo').subtract(2, 'months').format('MM'),
      year: moment.tz(this.reportDate, 'America/Sao_Paulo').subtract(2, 'months').format('yyyy'),
      count: 0,
    },
    {
      month: moment.tz(this.reportDate, 'America/Sao_Paulo').subtract(1, 'month').format('MM'),
      year: moment.tz(this.reportDate, 'America/Sao_Paulo').subtract(1, 'month').format('yyyy'),
      count: 0,
    },
  ]
  const startDate = moment(this.reportDate).subtract(2, 'months').startOf('month')
  const endDate = moment(this.reportDate).subtract(1, 'month').endOf('month')

  const messagesQuery = new MessagesQuery()
  messagesQuery.filterByLicensee(licensee._id)
  messagesQuery.filterByCreatedAt(startDate, endDate)

  const records = await messagesQuery.all()
  for (const record of records) {
    const month = moment(record.createdAt).format('MM')
    const year = moment(record.createdAt).format('yyyy')
    const summary = messagesSummary.find((summary) => summary.month === month && summary.year === year)
    if (summary) summary.count++
  }
  return messagesSummary
}

class BillingQuery {
  constructor(reportDate) {
    this.reportDate = reportDate
  }

  async all() {
    const result = []

    const licensees = await Licensee.find()
    for (const licensee of licensees) {
      const firstMessage = await getLicenseeFirstMessage(licensee)
      const lastMessage = await getLicenseeLastMessage(licensee)
      const messages = await getMessagesSummary(licensee)

      result.push({
        _id: licensee._id,
        creationDate: licensee.createdAt,
        firstMessageDate: firstMessage ? firstMessage.createdAt : null,
        lastMessageDate: lastMessage ? lastMessage.createdAt : null,
        billing: false,
        messages,
      })
    }

    return result
  }
}

module.exports = BillingQuery
