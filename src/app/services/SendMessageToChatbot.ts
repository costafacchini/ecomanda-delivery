async function sendMessageToChatbot(data, { messageRepository, createChatbotPlugin }: Record<string, any> = {}) {
  const { messageId, url, token } = data
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee'])
  const licensee = message.licensee

  const chatbotPlugin = createChatbotPlugin(licensee)

  await chatbotPlugin.sendMessage(messageId, url, token)
}

export { sendMessageToChatbot }
