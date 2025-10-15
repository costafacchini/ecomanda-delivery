import { MessageRepositoryDatabase } from '@repositories/message'

class MessagesSendedQuery {
  constructor(startDate, endDate, licenseeId) {
    this.startDate = startDate
    this.endDate = endDate
    this.licenseeId = licenseeId
  }

  async all() {
    const messageRepository = new MessageRepositoryDatabase()
    return await messageRepository.find({
      sended: true,
      createdAt: {
        $gte: this.startDate,
        $lt: this.endDate,
      },
      licensee: this.licenseeId,
    })
  }
}

export { MessagesSendedQuery }
