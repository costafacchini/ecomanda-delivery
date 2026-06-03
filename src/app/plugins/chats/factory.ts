import { Rocketchat } from './Rocketchat'
import { Crisp } from './Crisp'
import { Cuboup } from './Cuboup'
import { Chatwoot } from './Chatwoot'
import { LocalChat } from './LocalChat'

function createChatPlugin(licensee: any, dependencies = {}) {
  switch (licensee.chatDefault) {
    case 'rocketchat':
      return new Rocketchat(licensee, dependencies)
    case 'crisp':
      return new Crisp(licensee, dependencies)
    case 'cuboup':
      return new Cuboup(licensee, dependencies)
    case 'chatwoot':
      return new Chatwoot(licensee, dependencies)
    case 'local':
      return new LocalChat(licensee, dependencies)
    default:
      throw `Plugin de chat não configurado: ${licensee.chatDefault}`
  }
}

export { createChatPlugin }
