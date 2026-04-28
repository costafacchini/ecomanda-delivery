async function transferToChat(data, { messageRepository, createChatPlugin } = {}) {
  const { messageId, url } = data
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee'])
  const licensee = message.licensee

  const chatPlugin = createChatPlugin(licensee)

  await chatPlugin.transfer(messageId, url)
}

export { transferToChat }
