import Rocketchat from './Rocketchat'
import Crisp from './Crisp'
import Cuboup from './Cuboup'
import Chatwoot from './Chatwoot'

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

export default createChatPlugin
