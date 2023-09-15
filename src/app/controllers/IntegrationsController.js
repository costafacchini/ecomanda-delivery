const Body = require('@models/Body')

class IntegrationsController {
  async create(req, res) {
    const { body } = req

    await Body.create({ content: body, licensee: req.licensee._id, kind: 'webhook' })

    res.send(200)
  }
}

module.exports = IntegrationsController
