const Jivochat = require('./Jivochat')
const Rocketchat = require('./Rocketchat')

function createChatPlugin(licensee) {
  switch (licensee.chatDefault) {
    case 'jivochat':
      return new Jivochat(licensee)
    case 'rocketchat':
      return new Rocketchat(licensee)
    default:
      throw `Plugin de chat não configurado: ${licensee.chatDefault}`
  }
}

module.exports = createChatPlugin
