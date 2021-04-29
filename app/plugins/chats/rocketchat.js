class Rocketchat {
  constructor(requestBody) {
    this.action = this.#defineAction(requestBody)
    this.transformdedBody = this.#transformaBody(requestBody)
  }

  #defineAction(requestBody) {
    let action = ''
    if (requestBody.type.toLowerCase() === 'message') {
      action = 'send-message-to-messenger'
    } else if (requestBody.type.toLowerCase() === 'livechatsession') {
      action = 'close-chat'
    }

    return action
  }

  #transformaBody(requestBody) {
    if (this.action === 'close-chat') {
      return requestBody._id
    } else {
      //_id é o id da sala da conversa

      return requestBody
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
}

module.exports = Rocketchat

