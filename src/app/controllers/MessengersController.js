import Body from '../models/Body.js'
import { queueServer } from '../../config/queue.js'
import { logger } from '../../setup/logger.js'

class MessengersController {
  async message(req, res) {
    logger.info('Mensagem chegando do plugin de whatsapp', req.body)
    const body = new Body({ content: req.body, licensee: req.licensee._id, kind: 'normal' })
    await body.save()

    await queueServer.addJob('messenger-message', { bodyId: body._id, licenseeId: req.licensee._id })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de messenger agendado' })
  }
}

export { MessengersController }
