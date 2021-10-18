const Jivochat = require('./Jivochat')
const Rocketchat = require('./Rocketchat')
const Crisp = require('./Crisp')

function createChatPlugin(licensee) {
  switch (licensee.chatDefault) {
    case 'jivochat':
      return new Jivochat(licensee)
    case 'rocketchat':
      return new Rocketchat(licensee)
    case 'crisp':
      return new Crisp(licensee)
    default:
      throw `Plugin de chat não configurado: ${licensee.chatDefault}`
  }
}

module.exports = createChatPlugin
