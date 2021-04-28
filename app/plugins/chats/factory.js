const Jivochat = require('./jivochat')
const Rocketchat = require('./rocketchat')

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
