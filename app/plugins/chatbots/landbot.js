class Landbot {
  constructor(option, requestBody) {
    this.option = option
    this.requestBody = requestBody
  }

  transformdedBody() {

  }

  action() {
    if (this.option === 'transfer') {
      return 'send-message-to-chat'
    } else {
      return 'send-message-to-messenger'
    }
  }
}

module.exports = Landbot