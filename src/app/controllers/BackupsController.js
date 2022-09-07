const queueServer = require('@config/queue')
const { publishMessage } = require('@config/rabbitmq')

class BackupsController {
  schedule(_, res) {
    console.info('Agendando backup')

    publishMessage({ key: 'backup', body: {} })

    res.status(200).send({ body: 'Backup agendado' })
  }

  async clear(_, res) {
    console.info('Agendar limpeza de backups antigos')

    await queueServer.addJob('clear-backups', {})

    res.status(200).send({ body: 'Limpeza de backups antigos agendados' })
  }
}

module.exports = BackupsController
