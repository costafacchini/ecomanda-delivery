class MessagesSendedQuery {
  startDate: any
  endDate: any
  licenseeId: any
  messageRepository: any

  constructor(startDate, endDate, licenseeId, { messageRepository }: { messageRepository?: any } = {}) {
    this.startDate = startDate
    this.endDate = endDate
    this.licenseeId = licenseeId
    this.messageRepository = messageRepository
  }

  async all() {
    return await this.messageRepository.find({
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
