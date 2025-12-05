import { queueServer } from '../../config/queue.js'

async function scheduleSendMessageToMessenger({ messageId, url, token, contactId, licenseeId }) {
  await queueServer.addJob('send-message-to-messenger', { messageId, url, token, contactId, licenseeId })
}

export { scheduleSendMessageToMessenger }
