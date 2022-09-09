const { publishMessage } = require('@config/rabbitmq')

function scheduleSendMessageToMessenger({ messageId, url, token }) {
  publishMessage({ key: 'send-message-to-messenger', body: { messageId, url, token } })
}

module.exports = { scheduleSendMessageToMessenger }
