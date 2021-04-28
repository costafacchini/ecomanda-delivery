class Rocketchat {
  constructor(requestBody) {
    this.requestBody = requestBody
    this.action = this._defineAction(requestBody)
  }

  transformdedBody() {
    if (this.action === 'close-chat') {
      return this.requestBody._id
    } else {
      //_id é o id da sala da conversa

      return this.requestBody
    }
  }

  action() {
    return this.action
  }

  sendMessage() {
    //Verificar se já tem roomId no contact
    //Se não tiver, criar o visitante no livechat
    //  buscar o roomId utilizando o chatRef como token
    //  salvar o roomId no contato
    //Enviar mensagem
  }

  closeChat() {
    // modificar no licenciado o roomId para nulo e também o talkingWithChatBot caso o licenciado use chatBot
  }

  _defineAction(requestBody) {
    let action = ''
    if (requestBody.type.toLowerCase() === 'message') {
      action = 'send-message-to-messenger'
    } else if (requestBody.type.toLowerCase() === 'livechatsession') {
      action = 'close-chat'
    }

    return action
  }
}

module.exports = Rocketchat

