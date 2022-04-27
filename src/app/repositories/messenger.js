const queueServer = require('@config/queue')

async function scheduleSendMessageToMessenger({ messageId, url, token }) {
  await queueServer.addJob('send-message-to-messenger', { messageId, url, token })
}

module.exports = { scheduleSendMessageToMessenger }
