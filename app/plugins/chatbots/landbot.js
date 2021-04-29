class Landbot {
  constructor(option, requestBody) {
    this.option = option
    this.action = this.#defineAction()
    this.transformdedBody = this.#transformBody(requestBody)
  }

  #transformBody() {
    this.option
    return ''
  }

  #defineAction() {
    if (this.option === 'transfer') {
      return 'send-message-to-chat'
    } else {
      return 'send-message-to-messenger'
    }
  }

  sendMessage() {

  }
}

module.exports = Landbot