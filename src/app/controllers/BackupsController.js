import { logger } from '../helpers/logger.js'

class BackupsController {
  constructor({ publishMessage } = {}) {
    this.publishMessage = publishMessage

    this.schedule = this.schedule.bind(this)
    this.clear = this.clear.bind(this)
  }

  schedule(_, res) {
    logger.info('Agendando backup')

    this.publishMessage({ key: 'backup', body: {} })

    res.status(200).send({ body: 'Backup agendado' })
  }

  clear(_, res) {
    logger.info('Agendar limpeza de backups antigos')

    this.publishMessage({ key: 'clear-backups', body: {} })

    res.status(200).send({ body: 'Limpeza de backups antigos agendados' })
  }
}

export { BackupsController }
