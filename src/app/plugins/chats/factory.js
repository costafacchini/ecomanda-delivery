import { Rocketchat } from './Rocketchat.js'
import { Crisp } from './Crisp.js'
import { Cuboup } from './Cuboup.js'
import { Chatwoot } from './Chatwoot.js'

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

export { createChatPlugin }
