async function transformMessengerBody(data: any, { bodyRepository, createMessengerPlugin }: Record<string, any> = {}) {
  const { bodyId } = data
  const body = await bodyRepository.findFirst({ _id: bodyId }, ['licensee'])
  if (!body) {
    return []
  }
  const licensee = body.licensee
  const departmentId = body.department ?? null
  const extras: any = {}
  if (departmentId) {
    extras.department = departmentId
  }

  const messengerPlugin = createMessengerPlugin(licensee, extras)

  const actions = []
  const messages = await messengerPlugin.responseToMessages(body.content, { departmentId })

  for (const message of messages) {
    const action = messengerPlugin.action(message.destination)
    let url, token
    if (message.destination === 'to-chat') {
      url = licensee.chatUrl
      token = ''
    } else if (message.destination === 'to-messenger') {
      url = licensee.whatsappUrl
      token = licensee.whatsappToken
    } else {
      url = licensee.chatbotUrl
      token = licensee.chatbotAuthorizationToken
    }

    const bodyToSend = {
      messageId: message._id,
      contactId: message.contact._id,
      licenseeId: licensee._id,
      url,
      token,
    }

    actions.push({
      action,
      body: bodyToSend,
    })
  }

  await bodyRepository.update({ _id: bodyId }, { concluded: true })

  return actions
}

export { transformMessengerBody }
