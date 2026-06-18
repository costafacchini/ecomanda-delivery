import { sanitizeModelErrors } from '../helpers/SanitizeErrors'

class MessagesController {
  createMessagesQuery: any
  userRepository: any
  messageRepository: any
  queueServer: any
  createMessage: any

  constructor({
    createMessagesQuery,
    userRepository,
    messageRepository,
    queueServer,
    createMessage,
  }: Record<string, any> = {}) {
    this.createMessagesQuery = createMessagesQuery
    this.userRepository = userRepository
    this.messageRepository = messageRepository
    this.queueServer = queueServer
    this.createMessage = createMessage

    this.index = this.index.bind(this)
    this.create = this.create.bind(this)
    this.resend = this.resend.bind(this)
    this.ignore = this.ignore.bind(this)
  }

  async index(req: any, res: any) {
    const page = req.query.page || 1
    const limit = req.query.limit || 30

    const user = await this.userRepository.findFirst({ _id: req.userId })

    if (user && user.role !== 'super') {
      req.query.licensee = user.licensee?.toString()
    }

    const messagesQuery = this.createMessagesQuery()

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

  async create(req: any, res: any) {
    try {
      const message = await this.createMessage.execute(req.body)
      return res.status(201).send(message)
    } catch (err: any) {
      if (err?.errors) {
        return res.status(422).send({ errors: sanitizeModelErrors(err.errors) })
      }
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async resend(req: any, res: any) {
    try {
      const [user, message] = await Promise.all([
        this.userRepository.findFirst({ _id: req.userId }),
        this.messageRepository.findFirst({ _id: req.params.id }),
      ])

      if (!message) return res.status(404).json({ errors: { message: 'Message not found' } })

      if (!user) return res.status(404).json({ errors: { message: 'User not found' } })

      if (user.role !== 'super') {
        if (message.licensee.toString() !== user.licensee.toString()) {
          return res.status(403).json({ errors: { message: 'Forbidden' } })
        }
      }

      if (message.sended) {
        return res.status(422).json({ errors: { message: 'Message already sended' } })
      }

      message.sended = false
      message.error = null
      message.sendedAt = null

      await this.messageRepository.save(message)

      await this.queueServer.addJob('send-message-to-messenger', { messageId: message._id })

      return res.status(200).json(message)
    } catch (err: any) {
      return res.status(500).json({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }
  async ignore(req: any, res: any) {
    try {
      const [user, message] = await Promise.all([
        this.userRepository.findFirst({ _id: req.userId }),
        this.messageRepository.findFirst({ _id: req.params.id }),
      ])

      if (!message) return res.status(404).json({ errors: { message: 'Message not found' } })
      if (!user) return res.status(404).json({ errors: { message: 'User not found' } })

      if (user.role !== 'super') {
        if (message.licensee.toString() !== user.licensee.toString()) {
          return res.status(403).json({ errors: { message: 'Forbidden' } })
        }
      }

      message.ignored = true
      await this.messageRepository.save(message)

      return res.status(200).json(message)
    } catch (err: any) {
      return res.status(500).json({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }
}

export { MessagesController }
