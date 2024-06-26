const Landbot = require('./Landbot')

function createChatbotPlugin(licensee) {
  switch (licensee.chatbotDefault) {
    case 'landbot':
      return new Landbot(licensee)
    default:
      throw `Plugin de chatbot não configurado: ${licensee.chatbotDefault}`
  }
}

module.exports = createChatbotPlugin
