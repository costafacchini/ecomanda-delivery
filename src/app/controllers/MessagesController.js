const MessagesQuery = require('@queries/MessagesQuery')

class MessagesController {
  async index(req, res) {
    try {
      const page = req.body.page || 1
      const limit = req.body.limit || 30

      const messagesQuery = new MessagesQuery()

      messagesQuery.page(page)
      messagesQuery.limit(limit)

      if (req.body.initialDate && req.body.endDate) {
        messagesQuery.filterByCreatedAt(new Date(req.body.initialDate), new Date(req.body.endDate))
      }

      if (req.body.licensee) {
        messagesQuery.filterByLicensee(req.body.licensee)
      }

      if (req.body.contact) {
        messagesQuery.filterByContact(req.body.contact)
      }

      if (req.body.kind) {
        messagesQuery.filterByKind(req.body.kink)
      }

      if (req.body.destination) {
        messagesQuery.filterByDestination(req.body.destination)
      }

      if (req.body.sended) {
        messagesQuery.filterBySended(req.body.sended)
      }

      const messages = await messagesQuery.all()

      res.status(200).send(messages)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }
}

module.exports = MessagesController
