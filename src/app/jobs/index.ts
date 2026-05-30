import chatMessage from './ChatMessage'
import chatbotMessage from './ChatbotMessage'
import chatbotTransferToChat from './ChatbotTransferToChat'
import closeChat from './CloseChat'
import messengerMessage from './MessengerMessage'
import sendMessageToChat from './SendMessageToChat'
import sendMessageToChatbot from './SendMessageToChatbot'
import sendMessageToMessenger from './SendMessageToMessenger'
import resetChatbots from './ResetChatbots'
import resetChats from './ResetChats'
import resetCarts from './ResetCarts'
import transferToChat from './TransferToChat'
import backup from './Backup'
import clearBackups from './ClearBackups'
import sendContactToPagarMe from './SendContactToPagarMe'
import processBackgroundJob from './ProcessBackgroundjob'
import processBackgroundjobGetPix from './ProcessBackgroundjobGetPix'
import processBackgroundjobGetCreditCard from './ProcessBackgroundjobGetCreditCard'
import processBackgroundjobChargeCreditCard from './ProcessBackgroundjobChargeCreditCard'
import processBackgroundjobInviteCreditCard from './ProcessBackgroundjobInviteCreditCard'
import processBackgroundjobCancelOrder from './ProcessBackgroundjobCancelOrder'
import processWebhookRequest from './ProcessWebhookRequest'
import processPagarmeOrderPaid from './ProcessPagarmeOrderPaid'
import pedidos10Webhook from './Pedidos10Webhook'
import IntegrationSendOrder from './Integration10SendOrder'
import pedidos10ChangeOrderStatus from './Pedidos10ChangeOrderStatus'

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
  const index = jobs.indexOf(sendMessageToChat)
  if (index > -1) {
    jobs[index].workerEnabled = false
  }
}

if (process.env.DONT_SEND_MESSAGE_TO_MESSENGER == 'true') {
  const index = jobs.indexOf(sendMessageToMessenger)
  if (index > -1) {
    jobs[index].workerEnabled = false
  }
}

export default jobs
