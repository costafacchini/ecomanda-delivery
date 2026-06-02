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
import transferToChat from './TransferToChat'
import backup from './Backup'
import clearBackups from './ClearBackups'

const chatbotsJobs = [chatbotMessage, chatbotTransferToChat, sendMessageToChatbot, transferToChat]

const resetJobs = [resetChatbots, resetChats]

const backupJobs = [backup, clearBackups]

const chatJobs = [chatMessage, closeChat, sendMessageToChat]

const messengerJobs = [messengerMessage, sendMessageToMessenger]

const jobs: any[] = []

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
