import { Request, Response } from 'express'
import { logger } from '../helpers/logger'
import { IQueueServer } from '@config/queue'

class BackupsController {
  queueServer: IQueueServer

  constructor({ queueServer }: { queueServer?: IQueueServer } = {}) {
    this.queueServer = queueServer!

    this.schedule = this.schedule.bind(this)
    this.clear = this.clear.bind(this)
  }

  async schedule(_req: Request, res: Response) {
    logger.info('Agendando backup')

    await this.queueServer.addJob('backup', {})

    res.status(200).send({ body: 'Backup agendado' })
  }

  async clear(_req: Request, res: Response) {
    logger.info('Agendar limpeza de backups antigos')

    await this.queueServer.addJob('clear-backups', {})

    res.status(200).send({ body: 'Limpeza de backups antigos agendados' })
  }
}

export { BackupsController }
