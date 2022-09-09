const { publishMessage } = require('@config/rabbitmq')
const logger = require('@config/logger')

class BackupsController {
  schedule(_, res) {
    logger.info('Agendando backup')

    publishMessage({ key: 'backup', body: {} })

    res.status(200).send({ body: 'Backup agendado' })
  }

  clear(_, res) {
    logger.info('Agendar limpeza de backups antigos')

    publishMessage({ key: 'clear-backups', body: {} })

    res.status(200).send({ body: 'Limpeza de backups antigos agendados' })
  }
}

module.exports = BackupsController
