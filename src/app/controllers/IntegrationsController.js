const Body = require('@models/Body')
const { publishMessage } = require('@config/rabbitmq')

class IntegrationsController {
  async create(req, res) {
    const { body, query } = req

    const bodySaved = await Body.create({
      content: { ...body, provider: query.provider },
      licensee: req.licensee._id,
      kind: 'webhook',
    })

    publishMessage({ key: 'process-webhook-request', body: { bodyId: bodySaved._id } })

    res.sendStatus(200)
  }
}

module.exports = IntegrationsController
