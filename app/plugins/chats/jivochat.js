class Jivochat {
  constructor(requestBody) {
    this.requestBody = requestBody
    this.action = this._defineAction(requestBody)
  }

  transformdedBody() {
    return this.requestBody
  }

  action() {
    return this.action
  }

  sendMessage() {
    //Detectar o tipo do arquivo
    //Enviar arquivo
  }

  closeChat() {
    // modificar no licenciado o roomId para nulo e também o talkingWithChatBot caso o licenciado use chatBot
  }

  _defineAction(requestBody) {
    let action = ''
    if (requestBody.message.type !== 'typein' && requestBody.message.type !== 'typeout') {
      action = 'send-message'
    }

    return action
  }
}

module.exports = Jivochat
