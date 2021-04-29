class Jivochat {
  constructor(requestBody) {
    this.requestBody = requestBody
    this.action = this.#defineAction()
    this.transformdedBody = this.#transformBody()
  }

  #defineAction() {
    let action = ''
    if (this.requestBody.message.type !== 'typein' && this.requestBody.message.type !== 'typeout') {
      action = 'send-message'
    }

    return action
  }

  #transformBody() {
    this.requestBody
    return ''
  }

  sendMessage() {
    //Detectar o tipo do arquivo
    //Enviar arquivo
  }

  closeChat() {
    // modificar no licenciado o roomId para nulo e também o talkingWithChatBot caso o licenciado use chatBot
  }
}

module.exports = Jivochat
