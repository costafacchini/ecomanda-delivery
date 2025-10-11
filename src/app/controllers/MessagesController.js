import MessagesQuery from '@queries/MessagesQuery'

class MessagesController {
  async index(req, res) {
    const page = req.query.page || 1
    const limit = req.query.limit || 30

    const messagesQuery = new MessagesQuery()

    messagesQuery.page(page)
    messagesQuery.limit(limit)

    if (req.query.startDate && req.query.endDate) {
      messagesQuery.filterByCreatedAt(new Date(req.query.startDate), new Date(req.query.endDate))
    }

    if (req.query.licensee) {
      messagesQuery.filterByLicensee(req.query.licensee)
    }

    if (req.query.contact) {
      messagesQuery.filterByContact(req.query.contact)
    }

    if (req.query.kind) {
      messagesQuery.filterByKind(req.query.kind)
    }

    if (req.query.destination) {
      messagesQuery.filterByDestination(req.query.destination)
    }

    if (req.query.sended) {
      messagesQuery.filterBySended(req.query.sended)
    }

    const messages = await messagesQuery.all()

    res.status(200).send(messages)
  }
}

export default MessagesController
