const Message = require('@models/Message')

class MessagesSendedQuery {
  constructor(startDate, endDate, licenseeId) {
    this.startDate = startDate
    this.endDate = endDate
    this.licenseeId = licenseeId
  }

  async all() {
    return await Message.find({
      sended: true,
      createdAt: {
        $gte: this.startDate,
        $lt: this.endDate,
      },
      licensee: this.licenseeId,
    })
      .populate('contact', 'name number type')
      .exec()
  }
}

module.exports = MessagesSendedQuery
