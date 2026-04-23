import { MessageRepositoryDatabase } from '../repositories/message.js'

class MessagesFailedQuery {
  constructor(startDate, endDate, licenseeId, { messageRepository = new MessageRepositoryDatabase() } = {}) {
    this.startDate = startDate
    this.endDate = endDate
    this.licenseeId = licenseeId
    this.messageRepository = messageRepository
  }

  async all() {
    return await this.messageRepository.model().find({
      sended: false,
      createdAt: {
        $gte: this.startDate,
        $lt: this.endDate,
      },
      licensee: this.licenseeId,
      text: {
        $ne: 'Chat encerrado pelo agente',
      },
    })
  }
}

export { MessagesFailedQuery }
