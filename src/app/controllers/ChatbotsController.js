import Body from '../models/Body.js'
import { queueServer } from '../../config/queue.js'
import { publishMessage } from '../../config/rabbitmq.js'
import { logger } from '../../setup/logger.js'

class ChatbotsController {
  async message(req, res) {
    logger.info('Mensagem chegando do plugin de chatbot', req.body)
    const body = new Body({ content: req.body, licensee: req.licensee._id, kind: 'normal' })
    await body.save()

    await queueServer.addJob('chatbot-message', { bodyId: body._id, licenseeId: req.licensee._id })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de chatbot agendado' })
  }

  async transfer(req, res) {
    logger.info('Transferencia solicitada', req.body)
    const body = new Body({ content: req.body, licensee: req.licensee._id, kind: 'normal' })
    await body.save()

    await queueServer.addJob('chatbot-transfer-to-chat', { bodyId: body._id, licenseeId: req.licensee._id })

    res.status(200).send({ body: 'Solicitação de transferência do chatbot para a plataforma de chat agendado' })
  }

  reset(_, res) {
    logger.info('Agendando para resetar chatbots abandonados')

    publishMessage({ key: 'reset-chatbots', body: {} })

    res.status(200).send({ body: 'Solicitação para resetar os chatbots abandonados agendado' })
  }
}

export { ChatbotsController }
