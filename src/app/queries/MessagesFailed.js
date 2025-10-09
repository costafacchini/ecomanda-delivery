import Message from '@models/Message.js'

class MessagesFailedQuery {
  constructor(startDate, endDate, licenseeId) {
    this.startDate = startDate
    this.endDate = endDate
    this.licenseeId = licenseeId
  }

  async all() {
    return await Message.find({
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

export default MessagesFailedQuery
