import { queueServer } from '../../config/queue'

async function scheduleSendMessageToMessenger({ messageId, url, token, contactId, licenseeId }: any) {
  await queueServer.addJob('send-message-to-messenger', { messageId, url, token, contactId, licenseeId })
}

export { scheduleSendMessageToMessenger }
