const Landbot = require('./landbot')

function createChatbotPlugin(option, licensee, body) {
  switch (licensee.chatbotDefault) {
    case 'landbot':
      return new Landbot(option, body)
    default:
      throw `Plugin de chatbot não configurado: ${licensee.chatbotDefault}`
  }
}

module.exports = createChatbotPlugin
