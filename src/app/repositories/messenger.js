import queueServer from '@config/queue'

async function scheduleSendMessageToMessenger({ messageId, url, token }) {
  await queueServer.addJob('send-message-to-messenger', { messageId, url, token })
}

export { scheduleSendMessageToMessenger }
