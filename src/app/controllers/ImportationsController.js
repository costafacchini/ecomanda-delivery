const queueServer = require('@config/queue')

class ImportationsController {
  async schedule(req, res) {
    console.info(`Mensagem chegando para importação: ${JSON.stringify(req.body)}`)

    await queueServer.addJob('import-data', {
      databaseUrl: req.body.databaseUrl,
      licenseeId: req.licensee._id,
    })

    res.status(200).send({ body: 'Solicitação de importação agendada' })
  }
}

module.exports = ImportationsController
