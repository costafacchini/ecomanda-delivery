import { logger } from '../helpers/logger'

const delay = (ms: any) => new Promise((res) => setTimeout(res, ms))

class DelayController {
  async time(req: any, res: any) {
    const time = parseInt(req.params.time) * 1000
    logger.info(`Segurando o request por : ${time} milisegundos`)

    await delay(time)

    res.sendStatus(200)
  }
}

export { DelayController }
