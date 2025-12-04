import Body from '../models/Body.js'
import { queueServer } from '../../config/queue.js'

class MessengersController {
  async message(req, res) {
    console.info(`Mensagem chegando do plugin de whatsapp: ${JSON.stringify(req.body)}`)
    const body = new Body({ content: req.body, licensee: req.licensee._id, kind: 'normal' })
    await body.save()

    await queueServer.addJob('messenger-message', { bodyId: body._id, licenseeId: req.licensee._id })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de messenger agendado' })
  }
}

export { MessengersController }
