import { MessagesQuery } from './MessagesQuery'
import moment from 'moment-timezone'

async function getLicenseeFirstMessage(licensee: any, { messageRepository }: any) {
  const messagesQuery = new MessagesQuery({ messageRepository })
  messagesQuery.filterByLicensee(licensee._id)
  messagesQuery.filterBySended(true)
  messagesQuery.page(1)
  messagesQuery.limit(1)
  messagesQuery.sortBy('createdAt', 'asc')

  const records = await messagesQuery.all()
  return records[0]
}

async function getLicenseeLastMessage(licensee: any, { messageRepository }: any) {
  const messagesQuery = new MessagesQuery({ messageRepository })
  messagesQuery.filterByLicensee(licensee._id)
  messagesQuery.filterBySended(true)
  messagesQuery.page(1)
  messagesQuery.limit(1)

  const records = await messagesQuery.all()
  return records[0]
}

async function getMessagesSummary(licensee: any, reportDate: any, { messageRepository }: any) {
  const messagesSummary = [
    {
      month: moment.tz(reportDate, 'UTC').subtract(2, 'months').format('MM'),
      year: moment.tz(reportDate, 'UTC').subtract(2, 'months').format('yyyy'),
      count: 0,
    },
    {
      month: moment.tz(reportDate, 'UTC').subtract(1, 'month').format('MM'),
      year: moment.tz(reportDate, 'UTC').subtract(1, 'month').format('yyyy'),
      count: 0,
    },
  ]
  const startDateMonth1 = moment.tz(reportDate, 'UTC').subtract(2, 'months').startOf('month')
  const endDateMonth1 = moment.tz(reportDate, 'UTC').subtract(2, 'month').endOf('month')

  messagesSummary[0].count = await getMessagesCountedByMonth(licensee, startDateMonth1, endDateMonth1, {
    messageRepository,
  })

  const startDateMonth2 = moment.tz(reportDate, 'UTC').subtract(1, 'months').startOf('month')
  const endDateMonth2 = moment.tz(reportDate, 'UTC').subtract(1, 'month').endOf('month')

  messagesSummary[1].count = await getMessagesCountedByMonth(licensee, startDateMonth2, endDateMonth2, {
    messageRepository,
  })

  return messagesSummary
}

async function getMessagesCountedByMonth(licensee: any, startDate: any, endDate: any, { messageRepository }: any) {
  const messagesQuery = new MessagesQuery({ messageRepository })
  messagesQuery.filterByLicensee(licensee._id)
  messagesQuery.filterByCreatedAt(startDate, endDate)

  return await messagesQuery.count()
}

class BillingQuery {
  reportDate: any
  licenseeRepository: any
  messageRepository: any

  constructor(
    reportDate: any,
    { licenseeRepository, messageRepository }: { licenseeRepository?: any; messageRepository?: any } = {},
  ) {
    this.reportDate = reportDate
    this.licenseeRepository = licenseeRepository
    this.messageRepository = messageRepository
  }

  async all() {
    const result = []

    const licensees = await this.licenseeRepository.find()
    for (const licensee of licensees) {
      const firstMessage = await getLicenseeFirstMessage(licensee, {
        messageRepository: this.messageRepository,
      })
      const lastMessage = await getLicenseeLastMessage(licensee, {
        messageRepository: this.messageRepository,
      })
      const messages = await getMessagesSummary(licensee, this.reportDate, {
        messageRepository: this.messageRepository,
      })

      result.push({
        _id: licensee._id,
        name: licensee.name,
        createdAt: licensee.createdAt,
        firstMessageDate: firstMessage ? firstMessage.createdAt : null,
        lastMessageDate: lastMessage ? lastMessage.createdAt : null,
        billing: messages[0].count > 0 && messages[1].count > 0,
        messages,
      })
    }

    return result
  }
}

export { BillingQuery }
