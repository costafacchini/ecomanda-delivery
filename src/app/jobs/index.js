import chatMessage from './ChatMessage.js'
import chatbotMessage from './ChatbotMessage.js'
import chatbotTransferToChat from './ChatbotTransferToChat.js'
import closeChat from './CloseChat.js'
import messengerMessage from './MessengerMessage.js'
import sendMessageToChat from './SendMessageToChat.js'
import sendMessageToChatbot from './SendMessageToChatbot.js'
import sendMessageToMessenger from './SendMessageToMessenger.js'
// import transferToChat from './TransferToChat.js'
// import backup from './Backup.js'
// import clearBackups from './ClearBackups.js'
// import resetChatbots from './ResetChatbots.js'
// import resetChats from './ResetChats.js'
// import resetCarts from './ResetCarts.js'
// import sendContactToPagarMe from './SendContactToPagarMe.js'
// import processBackgroundJob from './ProcessBackgroundjob.js'
// import processBackgroundjobGetPix from './ProcessBackgroundjobGetPix.js'
// import processBackgroundjobGetCreditCard from './ProcessBackgroundjobGetCreditCard.js'
// import processBackgroundjobChargeCreditCard from './ProcessBackgroundjobChargeCreditCard.js'
// import processBackgroundjobInviteCreditCard from './ProcessBackgroundjobInviteCreditCard.js'
// import processBackgroundjobCancelOrder from './ProcessBackgroundjobCancelOrder.js'
// import processWebhookRequest from './ProcessWebhookRequest.js'
// import processPagarmeOrderPaid from './ProcessPagarmeOrderPaid.js'
// import pedidos10Webhook from './Pedidos10Webhook.js'
// import IntegrationSendOrder from './Integration10SendOrder.js'
// import pedidos10ChangeOrderStatus from './Pedidos10ChangeOrderStatus.js'

const jobs = [
  chatMessage,
  chatbotMessage,
  chatbotTransferToChat,
  closeChat,
  messengerMessage,
  sendMessageToChat,
  sendMessageToChatbot,
  sendMessageToMessenger,
  // transferToChat,
  // resetChatbots,
  // resetChats,
  // resetCarts,
  // backup,
  // clearBackups,
  // sendContactToPagarMe,
  // processBackgroundJob,
  // processBackgroundjobGetPix,
  // processBackgroundjobGetCreditCard,
  // processBackgroundjobChargeCreditCard,
  // processBackgroundjobInviteCreditCard,
  // processWebhookRequest,
  // processPagarmeOrderPaid,
  // processBackgroundjobCancelOrder,
  // pedidos10Webhook,
  // IntegrationSendOrder,
  // pedidos10ChangeOrderStatus,
]

export default jobs
