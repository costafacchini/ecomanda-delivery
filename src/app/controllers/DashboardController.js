class DashboardController {
  constructor({
    userRepository,
    licenseeRepository,
    contactRepository,
    messageRepository,
    roomRepository,
    redisConnection,
  } = {}) {
    this.userRepository = userRepository
    this.licenseeRepository = licenseeRepository
    this.contactRepository = contactRepository
    this.messageRepository = messageRepository
    this.roomRepository = roomRepository
    this.redisConnection = redisConnection

    this.licensees = this.licensees.bind(this)
    this.messageVolume = this.messageVolume.bind(this)
    this.deliveryRate = this.deliveryRate.bind(this)
    this.queue = this.queue.bind(this)
    this.conversations = this.conversations.bind(this)
    this.contacts = this.contacts.bind(this)
    this.messagesToday = this.messagesToday.bind(this)
    this.messagesPerDay = this.messagesPerDay.bind(this)
  }

  async _resolveUser(req) {
    return await this.userRepository.findFirst({ _id: req.userId })
  }

  async _cached(key, fn) {
    const cached = await this.redisConnection.get(key)
    if (cached) return JSON.parse(cached)
    const data = await fn()
    await this.redisConnection.setex(key, 600, JSON.stringify(data))
    return data
  }

  _parseDateRange(query) {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    return {
      startDate: query.startDate ? new Date(query.startDate) : startOfDay,
      endDate: query.endDate ? new Date(query.endDate) : endOfDay,
    }
  }

  async licensees(req, res) {
    try {
      const user = await this._resolveUser(req)
      if (!user) return res.status(404).json({ errors: { message: 'User not found' } })
      if (!user.isSuper) return res.status(403).json({ errors: { message: 'Forbidden' } })

      const cacheKey = 'dashboard:super:licensees'
      const data = await this._cached(cacheKey, async () => {
        const [total, active, demo, free, paid] = await Promise.all([
          this.licenseeRepository.model().where({}).countDocuments(),
          this.licenseeRepository.model().where({ active: true }).countDocuments(),
          this.licenseeRepository.model().where({ licenseKind: 'demo' }).countDocuments(),
          this.licenseeRepository.model().where({ licenseKind: 'free' }).countDocuments(),
          this.licenseeRepository.model().where({ licenseKind: 'paid' }).countDocuments(),
        ])
        return { total, active, by_kind: { demo, free, paid } }
      })

      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async messageVolume(req, res) {
    try {
      const user = await this._resolveUser(req)
      if (!user) return res.status(404).json({ errors: { message: 'User not found' } })
      if (!user.isSuper) return res.status(403).json({ errors: { message: 'Forbidden' } })

      const { startDate, endDate } = this._parseDateRange(req.query)
      const cacheKey = `dashboard:super:message-volume:${startDate.toISOString()}:${endDate.toISOString()}`

      const data = await this._cached(cacheKey, async () => {
        const perDayPipeline = [
          { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]
        const perHourPipeline = [
          { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%dT%H', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]

        const [perDay, perHour, sentCount, failedCount] = await Promise.all([
          this.messageRepository.model().aggregate(perDayPipeline),
          this.messageRepository.model().aggregate(perHourPipeline),
          this.messageRepository
            .model()
            .where({ sended: true, createdAt: { $gte: startDate, $lt: endDate } })
            .countDocuments(),
          this.messageRepository
            .model()
            .where({ sended: false, createdAt: { $gte: startDate, $lt: endDate } })
            .countDocuments(),
        ])

        const peakThroughput = perHour.length > 0 ? Math.max(...perHour.map((h) => h.count)) : 0
        const hourSpan = (endDate - startDate) / 3_600_000
        const avgTransferRate = parseFloat(((sentCount + failedCount) / hourSpan).toFixed(2))

        return {
          per_day: perDay,
          per_hour: perHour,
          peak_throughput: peakThroughput,
          avg_transfer_rate: avgTransferRate,
        }
      })

      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async deliveryRate(req, res) {
    try {
      const user = await this._resolveUser(req)
      if (!user) return res.status(404).json({ errors: { message: 'User not found' } })
      if (!user.isSuper) return res.status(403).json({ errors: { message: 'Forbidden' } })

      const { startDate, endDate } = this._parseDateRange(req.query)
      const cacheKey = `dashboard:super:delivery-rate:${startDate.toISOString()}:${endDate.toISOString()}`

      const data = await this._cached(cacheKey, async () => {
        const [sentCount, failedCount] = await Promise.all([
          this.messageRepository
            .model()
            .where({ sended: true, createdAt: { $gte: startDate, $lt: endDate } })
            .countDocuments(),
          this.messageRepository
            .model()
            .where({ sended: false, createdAt: { $gte: startDate, $lt: endDate } })
            .countDocuments(),
        ])

        const total = sentCount + failedCount
        const sentPct = total === 0 ? 0 : parseFloat(((sentCount / total) * 100).toFixed(2))
        const failedPct = total === 0 ? 0 : parseFloat(((failedCount / total) * 100).toFixed(2))

        return { sent_today: sentCount, failed_today: failedCount, sent_pct: sentPct, failed_pct: failedPct }
      })

      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async queue(req, res) {
    try {
      const user = await this._resolveUser(req)
      if (!user) return res.status(404).json({ errors: { message: 'User not found' } })
      if (!user.isSuper) return res.status(403).json({ errors: { message: 'Forbidden' } })

      const { startDate, endDate } = this._parseDateRange(req.query)
      const cacheKey = `dashboard:super:queue:${startDate.toISOString()}:${endDate.toISOString()}`

      const data = await this._cached(cacheKey, async () => {
        const avgQueuePipeline = [
          { $match: { sendedAt: { $exists: true }, createdAt: { $gte: startDate, $lt: endDate } } },
          { $group: { _id: null, avg: { $avg: { $divide: [{ $subtract: ['$sendedAt', '$createdAt'] }, 1000] } } } },
        ]

        const [pendingMessages, avgResult] = await Promise.all([
          this.messageRepository.model().where({ sended: false, destination: 'to-messenger' }).countDocuments(),
          this.messageRepository.model().aggregate(avgQueuePipeline),
        ])

        const avgTimeInQueueSeconds = avgResult.length > 0 ? parseFloat((avgResult[0].avg ?? 0).toFixed(2)) : 0

        return { pending_messages: pendingMessages, avg_time_in_queue_seconds: avgTimeInQueueSeconds }
      })

      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async conversations(req, res) {
    try {
      const user = await this._resolveUser(req)
      if (!user) return res.status(404).json({ errors: { message: 'User not found' } })
      if (!user.isSuper) return res.status(403).json({ errors: { message: 'Forbidden' } })

      const { startDate, endDate } = this._parseDateRange(req.query)
      const cacheKey = `dashboard:super:conversations:${startDate.toISOString()}:${endDate.toISOString()}`

      const data = await this._cached(cacheKey, async () => {
        const avgMsgPerConvPipeline = [
          { $match: { room: { $exists: true }, createdAt: { $gte: startDate, $lt: endDate } } },
          { $group: { _id: '$room', count: { $sum: 1 } } },
          { $group: { _id: null, avg: { $avg: '$count' } } },
        ]
        const avgDurationPipeline = [
          { $match: { closedAt: { $gte: startDate, $lt: endDate } } },
          { $group: { _id: null, avg: { $avg: { $divide: [{ $subtract: ['$closedAt', '$createdAt'] }, 1000] } } } },
        ]

        const [startedCount, endedCount, avgMsgResult, avgDurationResult] = await Promise.all([
          this.roomRepository
            .model()
            .where({ createdAt: { $gte: startDate, $lt: endDate } })
            .countDocuments(),
          this.roomRepository
            .model()
            .where({ closedAt: { $gte: startDate, $lt: endDate } })
            .countDocuments(),
          this.messageRepository.model().aggregate(avgMsgPerConvPipeline),
          this.roomRepository.model().aggregate(avgDurationPipeline),
        ])

        const avgMessagesPerConversation =
          avgMsgResult.length > 0 ? parseFloat((avgMsgResult[0].avg ?? 0).toFixed(2)) : 0
        const avgDurationSeconds =
          avgDurationResult.length > 0 ? parseFloat((avgDurationResult[0].avg ?? 0).toFixed(2)) : 0

        return {
          started_today: startedCount,
          ended_today: endedCount,
          avg_messages_per_conversation: avgMessagesPerConversation,
          avg_duration_seconds: avgDurationSeconds,
        }
      })

      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async contacts(req, res) {
    try {
      const user = await this._resolveUser(req)
      if (!user) return res.status(404).json({ errors: { message: 'User not found' } })
      if (user.isSuper) return res.status(403).json({ errors: { message: 'Forbidden' } })

      const cacheKey = `dashboard:licensee:${user.licensee}:contacts`

      const data = await this._cached(cacheKey, async () => {
        const [total, inChatbot] = await Promise.all([
          this.contactRepository.model().where({ licensee: user.licensee }).countDocuments(),
          this.contactRepository.model().where({ licensee: user.licensee, talkingWithChatBot: true }).countDocuments(),
        ])
        return { total, in_chatbot: inChatbot }
      })

      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async messagesToday(req, res) {
    try {
      const user = await this._resolveUser(req)
      if (!user) return res.status(404).json({ errors: { message: 'User not found' } })
      if (user.isSuper) return res.status(403).json({ errors: { message: 'Forbidden' } })

      const { startDate, endDate } = this._parseDateRange(req.query)
      const cacheKey = `dashboard:licensee:${user.licensee}:messages-today:${startDate.toISOString()}:${endDate.toISOString()}`

      const data = await this._cached(cacheKey, async () => {
        const [sentCount, failedCount] = await Promise.all([
          this.messageRepository
            .model()
            .where({ licensee: user.licensee, sended: true, createdAt: { $gte: startDate, $lt: endDate } })
            .countDocuments(),
          this.messageRepository
            .model()
            .where({ licensee: user.licensee, sended: false, createdAt: { $gte: startDate, $lt: endDate } })
            .countDocuments(),
        ])

        const total = sentCount + failedCount
        const sentPct = total === 0 ? 0 : parseFloat(((sentCount / total) * 100).toFixed(2))
        const failedPct = total === 0 ? 0 : parseFloat(((failedCount / total) * 100).toFixed(2))

        return { sent_today: sentCount, failed_today: failedCount, sent_pct: sentPct, failed_pct: failedPct }
      })

      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async messagesPerDay(req, res) {
    try {
      const user = await this._resolveUser(req)
      if (!user) return res.status(404).json({ errors: { message: 'User not found' } })
      if (user.isSuper) return res.status(403).json({ errors: { message: 'Forbidden' } })

      const { startDate, endDate } = this._parseDateRange(req.query)
      const cacheKey = `dashboard:licensee:${user.licensee}:messages-per-day:${startDate.toISOString()}:${endDate.toISOString()}`

      const data = await this._cached(cacheKey, async () => {
        const sevenDaysAgo = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        const perDayPipeline = [
          { $match: { createdAt: { $gte: sevenDaysAgo, $lt: endDate }, licensee: user.licensee } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]

        const perDay = await this.messageRepository.model().aggregate(perDayPipeline)
        return { per_day: perDay }
      })

      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }
}

export { DashboardController }
