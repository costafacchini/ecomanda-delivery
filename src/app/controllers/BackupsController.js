import { publishMessage } from '../../config/rabbitmq.js'
import { logger } from '../../setup/logger.js'

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

export { BackupsController }
