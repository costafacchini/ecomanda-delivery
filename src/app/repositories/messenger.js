const queueServer = require('@config/queue')
const { publishMessage } = require('@config/rabbitmq')

async function scheduleSendMessageToMessenger({ messageId, url, token }) {
  await queueServer.addJob('send-message-to-messenger', { messageId, url, token })
}

function scheduleSendMessageToMessengerRabbit({ messageId, url, token }) {
  publishMessage({ key: 'send-message-to-messenger', body: { messageId, url, token } })
}

module.exports = { scheduleSendMessageToMessenger, scheduleSendMessageToMessengerRabbit }
