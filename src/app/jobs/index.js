import chatMessage from './ChatMessage'
import chatbotMessage from './ChatbotMessage'
import chatbotTransferToChat from './ChatbotTransferToChat'
import closeChat from './CloseChat'
import messengerMessage from './MessengerMessage'
import sendMessageToChat from './SendMessageToChat'
import sendMessageToChatbot from './SendMessageToChatbot'
import sendMessageToMessenger from './SendMessageToMessenger'
import transferToChat from './TransferToChat'
import backup from './Backup'
import clearBackups from './ClearBackups'
import resetChatbots from './ResetChatbots'
import resetChats from './ResetChats'
import resetCarts from './ResetCarts'
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
  sendContactToPagarMe,
  processBackgroundJob,
  processBackgroundjobGetPix,
  processBackgroundjobGetCreditCard,
  processBackgroundjobChargeCreditCard,
  processBackgroundjobInviteCreditCard,
  processWebhookRequest,
  processPagarmeOrderPaid,
  processBackgroundjobCancelOrder,
  pedidos10Webhook,
  IntegrationSendOrder,
  pedidos10ChangeOrderStatus,
]

export default jobs
