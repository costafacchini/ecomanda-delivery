import { Request, Response } from 'express'
import { logger } from '../helpers/logger'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

class DelayController {
  async time(req: Request, res: Response) {
    const time = parseInt(req.params.time as string) * 1000
    logger.info(`Segurando o request por : ${time} milisegundos`)

    await delay(time)

    res.sendStatus(200)
  }
}

export { DelayController }
