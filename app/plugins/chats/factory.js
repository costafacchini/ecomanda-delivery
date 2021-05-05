const Jivochat = require('./Jivochat')
const Rocketchat = require('./Rocketchat')

function createChatPlugin(licensee, body) {
  switch (licensee.chatDefault) {
    case 'jivochat':
      return new Jivochat(body)
    case 'rocketchat':
      return new Rocketchat(body)
    default:
      throw `Plugin de chat não configurado: ${licensee.chatDefault}`
  }
}

module.exports = createChatPlugin
