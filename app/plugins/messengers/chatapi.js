class Chatapi {
  constructor(requestBody) {
    this.requestBody = requestBody
    this.action = this.#defineAction()
    this.transformdedBody = this.#transformBody()
  }

  #defineAction() {
    //recuperar o contact
    //verificar se usa chatbot
    //  'send-message-to-chatbot'
    this.requestBody
    return 'send-message-to-chat'
  }

  #transformBody() {
    this.action
    return ''
  }

  sendMessage() {
    //Enviar mensagem
  }
}

module.exports = Chatapi
