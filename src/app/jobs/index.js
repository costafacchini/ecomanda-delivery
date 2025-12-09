import chatMessage from './ChatMessage.js'
import chatbotMessage from './ChatbotMessage.js'
import chatbotTransferToChat from './ChatbotTransferToChat.js'
import closeChat from './CloseChat.js'
import messengerMessage from './MessengerMessage.js'
import sendMessageToChat from './SendMessageToChat.js'
import sendMessageToChatbot from './SendMessageToChatbot.js'
import sendMessageToMessenger from './SendMessageToMessenger.js'
import resetChatbots from './ResetChatbots.js'
import resetChats from './ResetChats.js'
import resetCarts from './ResetCarts.js'
import transferToChat from './TransferToChat.js'
import backup from './Backup.js'
import clearBackups from './ClearBackups.js'
import sendContactToPagarMe from './SendContactToPagarMe.js'
import processBackgroundJob from './ProcessBackgroundjob.js'
import processBackgroundjobGetPix from './ProcessBackgroundjobGetPix.js'
import processBackgroundjobGetCreditCard from './ProcessBackgroundjobGetCreditCard.js'
import processBackgroundjobChargeCreditCard from './ProcessBackgroundjobChargeCreditCard.js'
import processBackgroundjobInviteCreditCard from './ProcessBackgroundjobInviteCreditCard.js'
import processBackgroundjobCancelOrder from './ProcessBackgroundjobCancelOrder.js'
import processWebhookRequest from './ProcessWebhookRequest.js'
import processPagarmeOrderPaid from './ProcessPagarmeOrderPaid.js'
import pedidos10Webhook from './Pedidos10Webhook.js'
import IntegrationSendOrder from './Integration10SendOrder.js'
import pedidos10ChangeOrderStatus from './Pedidos10ChangeOrderStatus.js'

const pedidos10Jobs = [pedidos10Webhook, IntegrationSendOrder, pedidos10ChangeOrderStatus]

const chatbotsJobs = [chatbotMessage, chatbotTransferToChat, sendMessageToChatbot, transferToChat]

const resetJobs = [resetCarts, resetChatbots, resetChats]

const backupJobs = [backup, clearBackups]

const pagarMeJobs = [
  sendContactToPagarMe,
  processBackgroundJob,
  processBackgroundjobGetPix,
  processBackgroundjobGetCreditCard,
  processBackgroundjobChargeCreditCard,
  processBackgroundjobInviteCreditCard,
  processWebhookRequest,
  processPagarmeOrderPaid,
  processBackgroundjobCancelOrder,
]

const chatJobs = [chatMessage, closeChat, sendMessageToChat]

const messengerJobs = [messengerMessage, sendMessageToMessenger]

const jobs = []

if (process.env.INTEGRATE_PEDIDOS10 === 'true') {
  jobs.push(...pedidos10Jobs)
}

if (process.env.INTEGRATE_PAGARME === 'true') {
  jobs.push(...pagarMeJobs)
}

if (process.env.ENABLE_BACKUPS === 'true') {
  jobs.push(...backupJobs)
}

if (process.env.ENABLE_CHATBOTS === 'true') {
  jobs.push(...chatbotsJobs)
}

if (process.env.ENABLE_RESET_JOBS === 'true') {
  jobs.push(...resetJobs)
}

if (process.env.ENABLE_CHATS === 'true') {
  jobs.push(...chatJobs)
}

if (process.env.ENABLE_MESSENGERS === 'true') {
  jobs.push(...messengerJobs)
}

if (process.env.DONT_SEND_MESSAGE_TO_CHAT == 'true') {
  jobs.splice(jobs.indexOf(sendMessageToChat), 1)
}

if (process.env.DONT_SEND_MESSAGE_TO_MESSENGER == 'true') {
  jobs.splice(jobs.indexOf(sendMessageToMessenger), 1)
}

export default jobs
