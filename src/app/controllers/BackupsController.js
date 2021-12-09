const queueServer = require('@config/queue')

class BackupsController {
  async schedule(_, res) {
    console.info('Agendando backup')

    await queueServer.addJob('backup', {})

    res.status(200).send({ body: 'Backup agendado' })
  }

  async clear(_, res) {
    console.info('Agendar limpeza de backups antigos')

    await queueServer.addJob('clear-backups', {})

    res.status(200).send({ body: 'Limpeza de backups antigos agendados' })
  }
}

module.exports = BackupsController
