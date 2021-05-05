const chatMessage = require('./chat-message')
const chatbotMessage = require('./chatbot-message')
const chatbotTransferToChat = require('./chatbot-transfer-to-chat')
const closeChat = require('./close-chat')
const messengerMessage = require('./messenger-message')
const sendMessageToChat = require('./send-message-to-chat')
const sendMessageToChatbot = require('./send-message-to-chatbot')
const sendMessageToMessenger = require('./send-message-to-messenger')

const jobs = [
  chatMessage,
  chatbotMessage,
  chatbotTransferToChat,
  closeChat,
  messengerMessage,
  sendMessageToChat,
  sendMessageToChatbot,
  sendMessageToMessenger
]

module.exports = jobs
