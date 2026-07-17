const EXCLUDE_SYSTEM_CLOSE = { $nor: [{ kind: 'text', text: 'Chat encerrado pelo agente' }] }

class RoomsController {
  userRepository: any
  roomRepository: any
  messageRepository: any
  departmentRepository: any
  contactRepository: any

  constructor({
    userRepository,
    roomRepository,
    messageRepository,
    departmentRepository,
    contactRepository,
  }: Record<string, any> = {}) {
    this.userRepository = userRepository
    this.roomRepository = roomRepository
    this.messageRepository = messageRepository
    this.departmentRepository = departmentRepository
    this.contactRepository = contactRepository

    this.index = this.index.bind(this)
    this.create = this.create.bind(this)
    this.messages = this.messages.bind(this)
    this.closeRoom = this.closeRoom.bind(this)
  }

  async _resolveUser(req: any) {
    return await this.userRepository.findFirst({ _id: req.userId }, ['licensee'])
  }

  _resolveLicenseeId(user: any) {
    return user.licensee?._id ?? user.licensee
  }

  async index(req: any, res: any) {
    try {
      const user = await this._resolveUser(req)
      if (!user) return res.status(404).json({ errors: { message: 'User not found' } })

      let licenseeId: any
      if (user.role === 'super') {
        if (!req.query.licensee) {
          return res.status(400).json({ errors: { message: 'licensee query param required for super users' } })
        }
        licenseeId = req.query.licensee
      } else {
        licenseeId = this._resolveLicenseeId(user)
      }

      const agentSectors = await this.departmentRepository
        .model()
        .find({ users: req.userId, licensee: licenseeId, active: true })
        .select('_id')
        .lean()

      const departmentIds = agentSectors.map((s: any) => s._id)
      const page = Math.max(1, parseInt(req.query.page as string) || 1)
      const limit = 20

      const results = await this.roomRepository.findForLicensee(licenseeId, { departmentIds, page, limit })

      const hasMore = results.length > limit
      const rooms: any[] = hasMore ? results.slice(0, limit) : results

      const roomIds = rooms.map((r: any) => r._id)
      const lastMessages = await this.messageRepository
        .model()
        .aggregate([
          { $match: { room: { $in: roomIds }, ...EXCLUDE_SYSTEM_CLOSE } },
          { $sort: { createdAt: -1 } },
          { $group: { _id: '$room', text: { $first: '$text' }, createdAt: { $first: '$createdAt' } } },
        ])

      const lastMsgMap: Record<string, any> = {}
      for (const m of lastMessages) lastMsgMap[m._id.toString()] = m

      const roomsWithLast = rooms.map((r: any) => ({
        ...r,
        lastMessage: lastMsgMap[r._id.toString()] ?? null,
      }))

      return res.status(200).json({ rooms: roomsWithLast, hasMore })
    } catch (err: any) {
      return res.status(500).json({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async create(req: any, res: any) {
    try {
      const user = await this._resolveUser(req)
      if (!user) return res.status(404).json({ errors: { message: 'User not found' } })

      const licenseeId = user.role === 'super' ? req.body.licenseeId : this._resolveLicenseeId(user)

      const contact = await this.contactRepository.findFirst({ _id: req.body.contactId })
      if (!contact) return res.status(404).json({ errors: { message: 'Contact not found' } })

      const contactLicenseeId = contact.licensee?._id?.toString() ?? contact.licensee?.toString()
      const resolvedLicenseeId = licenseeId?.toString()

      if (user.role !== 'super' && contactLicenseeId !== resolvedLicenseeId) {
        return res.status(403).json({ errors: { message: 'Forbidden' } })
      }

      const existingRoom = await this.roomRepository.findOpenForContact(contact._id)
      if (existingRoom) {
        return res.status(200).json({ room: existingRoom })
      }

      await this.roomRepository.create({ contact: contact._id, status: 'pending' })
      const room = await this.roomRepository.findOpenForContact(contact._id)
      return res.status(201).json({ room })
    } catch (err: any) {
      return res.status(500).json({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async messages(req: any, res: any) {
    try {
      const user = await this._resolveUser(req)
      if (!user) return res.status(404).json({ errors: { message: 'User not found' } })

      const room = await this.roomRepository.findFirst({ _id: req.params.roomId }, ['contact'])
      if (!room) return res.status(404).json({ errors: { message: 'Room not found' } })

      if (user.role !== 'super') {
        const userLicenseeId = this._resolveLicenseeId(user)?.toString()
        const roomLicenseeId = room.contact?.licensee?._id?.toString() ?? room.contact?.licensee?.toString() ?? null

        if (userLicenseeId !== roomLicenseeId) {
          return res.status(403).json({ errors: { message: 'Forbidden' } })
        }
      }

      const page = Math.max(1, parseInt(req.query.page as string) || 1)
      const limit = 30

      const total = await this.messageRepository.model().countDocuments({ room: room._id })
      const messages = await this.messageRepository
        .model()
        .find({ room: room._id })
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit + 1)
        .lean()

      const hasMore = messages.length > limit
      const pageMessages = hasMore ? messages.slice(0, limit) : messages

      return res.status(200).json({ messages: pageMessages, total, page, hasMore })
    } catch (err: any) {
      return res.status(500).json({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async closeRoom(req: any, res: any) {
    try {
      const user = await this._resolveUser(req)
      if (!user) return res.status(404).json({ errors: { message: 'User not found' } })

      const room = await this.roomRepository.model().findById(req.params.roomId)
      if (!room) return res.status(404).json({ errors: { message: 'Room not found' } })

      if (user.role !== 'super') {
        const userLicenseeId = this._resolveLicenseeId(user)?.toString()
        const contact = await this.contactRepository.findFirst({ _id: room.contact })
        const roomLicenseeId = contact?.licensee?._id?.toString() ?? contact?.licensee?.toString() ?? null
        if (userLicenseeId !== roomLicenseeId) {
          return res.status(403).json({ errors: { message: 'Forbidden' } })
        }
      }

      if (room.closed) return res.status(200).json({ message: 'Already closed' })

      room.status = 'closed'
      await room.save()

      return res.status(200).json({ message: 'Room closed' })
    } catch (err: any) {
      return res.status(500).json({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }
}

export { RoomsController }
