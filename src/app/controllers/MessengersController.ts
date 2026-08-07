import { Request, Response } from 'express'
import { IngestMessengerMessage } from '../usecases/webhooks/IngestMessengerMessage'

class MessengersController {
  ingestMessengerMessage: IngestMessengerMessage

  constructor({ ingestMessengerMessage }: { ingestMessengerMessage?: IngestMessengerMessage } = {}) {
    this.ingestMessengerMessage = ingestMessengerMessage!

    this.message = this.message.bind(this)
  }

  async message(req: Request, res: Response) {
    await this.ingestMessengerMessage.execute({
      body: req.body,
      licenseeId: req.licensee!._id as string,
      departmentId: (req.department?._id as string) ?? null,
      inboxId: (req.inbox?._id as string) ?? null,
    })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de messenger agendado' })
  }
}

export { MessengersController }
