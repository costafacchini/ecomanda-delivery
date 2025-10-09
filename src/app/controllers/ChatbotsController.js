import Body from '@models/Body.js'
import queueServer from '@config/queue.js'
import { publishMessage  } from '@config/rabbitmq.js'

class ChatbotsController {
  async message(req, res) {
    console.info(`Mensagem chegando do plugin de chatbot: ${JSON.stringify(req.body)}`)
    const body = new Body({ content: req.body, licensee: req.licensee._id, kind: 'normal' })
    await body.save()

    await queueServer.addJob('chatbot-message', { bodyId: body._id })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de chatbot agendado' })
  }

  async transfer(req, res) {
    console.info(`Transferencia solicitada: ${JSON.stringify(req.body)}`)
    const body = new Body({ content: req.body, licensee: req.licensee._id, kind: 'normal' })
    await body.save()

    await queueServer.addJob('chatbot-transfer-to-chat', { bodyId: body._id })

    res.status(200).send({ body: 'Solicitação de transferência do chatbot para a plataforma de chat agendado' })
  }

  reset(_, res) {
    console.info('Agendando para resetar chatbots abandonados')

    publishMessage({ key: 'reset-chatbots', body: {} })

    res.status(200).send({ body: 'Solicitação para resetar os chatbots abandonados agendado' })
  }
}

export default ChatbotsController
