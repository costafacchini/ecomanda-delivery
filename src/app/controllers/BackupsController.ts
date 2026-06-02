import { logger } from '../helpers/logger'

class BackupsController {
  queueServer: any

  constructor({ queueServer }: Record<string, any> = {}) {
    this.queueServer = queueServer

    this.schedule = this.schedule.bind(this)
    this.clear = this.clear.bind(this)
  }

  async schedule(_: any, res: any) {
    logger.info('Agendando backup')

    await this.queueServer.addJob('backup', {})

    res.status(200).send({ body: 'Backup agendado' })
  }

  async clear(_: any, res: any) {
    logger.info('Agendar limpeza de backups antigos')

    await this.queueServer.addJob('clear-backups', {})

    res.status(200).send({ body: 'Limpeza de backups antigos agendados' })
  }
}

export { BackupsController }
