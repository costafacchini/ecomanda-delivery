async function sendMessageToMessenger(data, { messageRepository, createMessengerPlugin } = {}) {
  const { messageId, url, token } = data
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee'])
  const licensee = message.licensee

  const messegnerPlugin = createMessengerPlugin(licensee)

  await messegnerPlugin.sendMessage(messageId, url, token)
}

export { sendMessageToMessenger }
