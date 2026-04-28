import { Rocketchat } from './Rocketchat.js'
import { Crisp } from './Crisp.js'
import { Cuboup } from './Cuboup.js'
import { Chatwoot } from './Chatwoot.js'

function createChatPlugin(licensee, dependencies = {}) {
  switch (licensee.chatDefault) {
    case 'rocketchat':
      return new Rocketchat(licensee, dependencies)
    case 'crisp':
      return new Crisp(licensee, dependencies)
    case 'cuboup':
      return new Cuboup(licensee, dependencies)
    case 'chatwoot':
      return new Chatwoot(licensee, dependencies)
    default:
      throw `Plugin de chat não configurado: ${licensee.chatDefault}`
  }
}

export { createChatPlugin }
