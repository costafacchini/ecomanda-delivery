const chatMessage = require('./ChatMessage')
const chatbotMessage = require('./ChatbotMessage')
const chatbotTransferToChat = require('./ChatbotTransferToChat')
const closeChat = require('./CloseChat')
const messengerMessage = require('./MessengerMessage')
const sendMessageToChat = require('./SendMessageToChat')
const sendMessageToChatbot = require('./SendMessageToChatbot')
const sendMessageToMessenger = require('./SendMessageToMessenger')
const transferToChat = require('./TransferToChat')
const backup = require('./Backup')
const clearBackups = require('./ClearBackups')
const resetChatbots = require('./ResetChatbots')
const resetChats = require('./ResetChats')
const resetCarts = require('./ResetCarts')

const jobs = [
  chatMessage,
  chatbotMessage,
  chatbotTransferToChat,
  closeChat,
  messengerMessage,
  sendMessageToChat,
  sendMessageToChatbot,
  sendMessageToMessenger,
  transferToChat,
  resetChatbots,
  resetChats,
  resetCarts,
  backup,
  clearBackups,
]

module.exports = jobs
