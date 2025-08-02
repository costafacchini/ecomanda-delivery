const Rocketchat = require('./Rocketchat')
const Crisp = require('./Crisp')
const Cuboup = require('./Cuboup')
const Chatwoot = require('./Chatwoot')

function createChatPlugin(licensee) {
  switch (licensee.chatDefault) {
    case 'rocketchat':
      return new Rocketchat(licensee)
    case 'crisp':
      return new Crisp(licensee)
    case 'cuboup':
      return new Cuboup(licensee)
    case 'chatwoot':
      return new Chatwoot(licensee)
    default:
      throw `Plugin de chat não configurado: ${licensee.chatDefault}`
  }
}

module.exports = createChatPlugin
