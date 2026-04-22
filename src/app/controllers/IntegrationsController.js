import { BodyRepositoryDatabase } from '../repositories/body.js'

class IntegrationsController {
  constructor({ bodyRepository = new BodyRepositoryDatabase(), publishMessage } = {}) {
    this.bodyRepository = bodyRepository
    this.publishMessage = publishMessage

    this.create = this.create.bind(this)
  }

  async create(req, res) {
    const { body, query } = req

    const bodySaved = await this.bodyRepository.create({
      content: { ...body, provider: query.provider },
      licensee: req.licensee._id,
      kind: 'webhook',
    })

    this.publishMessage({ key: 'process-webhook-request', body: { bodyId: bodySaved._id } })

    res.sendStatus(200)
  }
}

export { IntegrationsController }
