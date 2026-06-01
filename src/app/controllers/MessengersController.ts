class MessengersController {
  ingestMessengerMessage: any

  constructor({ ingestMessengerMessage }: Record<string, any> = {}) {
    this.ingestMessengerMessage = ingestMessengerMessage

    this.message = this.message.bind(this)
  }

  async message(req: any, res: any) {
    await this.ingestMessengerMessage.execute({ body: req.body, licenseeId: req.licensee._id })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de messenger agendado' })
  }
}

export { MessengersController }
