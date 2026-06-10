async function sendMessageToMessenger(
  data: any,
  { messageRepository, createMessengerPlugin }: Record<string, any> = {},
) {
  const { messageId, url, token } = data
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee'])
  const licensee = message.licensee

  const extras: any = {}
  if (message.sector) {
    extras.sector = message.sector
  }
  const messegnerPlugin = createMessengerPlugin(licensee, extras)

  await messegnerPlugin.sendMessage(messageId, url ?? licensee.whatsappUrl, token ?? licensee.whatsappToken)
}

export { sendMessageToMessenger }
