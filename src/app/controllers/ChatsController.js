class ChatsController {
  constructor({ ingestChatMessage, publishMessage } = {}) {
    this.ingestChatMessage = ingestChatMessage
    this.publishMessage = publishMessage

    this.message = this.message.bind(this)
    this.reset = this.reset.bind(this)
  }

  async message(req, res) {
    await this.ingestChatMessage.execute({ body: req.body, licenseeId: req.licensee._id })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de chat agendado' })
  }

  reset(_, res) {
    console.info('Agendando para resetar chats expirando')

    this.publishMessage({ key: 'reset-chats', body: {} })

    res.status(200).send({ body: 'Solicitação para avisar os chats com janela vencendo agendado com sucesso' })
  }
}

export { ChatsController }
