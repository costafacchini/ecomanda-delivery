import Body from '../models/Body.js'
import { queueServer } from '../../config/queue.js'
import { publishMessage } from '../../config/rabbitmq.js'

class ChatsController {
  async message(req, res) {
    const { body } = req
    // Remove crmData because of Rocketchat send a higher history inside the body
    delete body['crmData']

    console.info(`Mensagem chegando do plugin de chat: ${JSON.stringify(body)}`)
    const bodySaved = await Body.create({ content: body, licensee: req.licensee._id, kind: 'normal' })

    await queueServer.addJob('chat-message', { bodyId: bodySaved._id, licenseeId: req.licensee._id })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de chat agendado' })
  }

  reset(_, res) {
    console.info('Agendando para resetar chats expirando')

    publishMessage({ key: 'reset-chats', body: {} })

    res.status(200).send({ body: 'Solicitação para avisar os chats com janela vencendo agendado com sucesso' })
  }
}

export { ChatsController }
