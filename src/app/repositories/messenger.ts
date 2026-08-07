import { queueServer } from '../../config/queue'

interface SendMessageToMessengerPayload {
  messageId: string
  url: string
  token: string
  contactId: string
  licenseeId: string
}

async function scheduleSendMessageToMessenger({
  messageId,
  url,
  token,
  contactId,
  licenseeId,
}: SendMessageToMessengerPayload) {
  await queueServer.addJob('send-message-to-messenger', { messageId, url, token, contactId, licenseeId })
}

export { scheduleSendMessageToMessenger }
