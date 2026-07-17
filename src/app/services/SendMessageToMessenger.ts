async function sendMessageToMessenger(
  data: any,
  { messageRepository, createMessengerPlugin }: Record<string, any> = {},
) {
  const { messageId, url, token } = data
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee', 'contact'])
  const licensee = message.licensee

  if (message.contact?.type === 'web') {
    message.sended = true
    await messageRepository.save(message)
    return
  }

  const extras: any = {}
  if (message.department) {
    extras.department = message.department
  }
  const messegnerPlugin = createMessengerPlugin(licensee, extras)

  await messegnerPlugin.sendMessage(messageId, url ?? licensee.whatsappUrl, token ?? licensee.whatsappToken)
}

export { sendMessageToMessenger }
