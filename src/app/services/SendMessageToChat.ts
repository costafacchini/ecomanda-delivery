async function sendMessageToChat(data, { messageRepository, createChatPlugin }: Record<string, any> = {}) {
  const { messageId, url } = data
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee'])
  const licensee = message.licensee

  const chatPlugin = createChatPlugin(licensee)

  await chatPlugin.sendMessage(messageId, url)
}

export { sendMessageToChat }
