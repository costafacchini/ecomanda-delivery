import { Landbot } from './Landbot'

function createChatbotPlugin(licensee, dependencies = {}) {
  switch (licensee.chatbotDefault) {
    case 'landbot':
      return new Landbot(licensee, dependencies)
    default:
      throw `Plugin de chatbot não configurado: ${licensee.chatbotDefault}`
  }
}

export { createChatbotPlugin }
