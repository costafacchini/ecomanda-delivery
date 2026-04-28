import moment from 'moment-timezone'

const WINDOW_HOURS = 24
const WARNING_MINUTES = 10

async function sendMessageToChat(licensee, messageToSend, { createChatPlugin } = {}) {
  const chatPlugin = createChatPlugin(licensee)

  await chatPlugin.sendMessage(messageToSend._id, licensee.chatUrl)
}

async function clearWaStartChatOnContact(contact, { contactRepository } = {}) {
  await contactRepository.update(contact._id, { wa_start_chat: null })

  return
}

async function warningAboutChatsEnding(licensee, { contactRepository, messageRepository, createChatPlugin } = {}) {
  if (licensee.useWhatsappWindow !== true) return

  const warningWindowStart = moment().subtract(WINDOW_HOURS, 'hours')
  const warningWindowEnd = moment(warningWindowStart).add(WARNING_MINUTES, 'minutes')

  const contacts = await contactRepository.find({
    licensee: licensee._id,
    wa_start_chat: {
      $ne: null,
      $gt: warningWindowStart.toDate(),
      $lte: warningWindowEnd.toDate(),
    },
  })

  for (const contact of contacts) {
    const messageToSend = await messageRepository.createMessageToWarnAboutWindowOfWhatsassIsEnding(contact, licensee)

    await sendMessageToChat(licensee, messageToSend, { createChatPlugin })
  }
}

async function warningAboutChatsExpired(licensee, { contactRepository, messageRepository, createChatPlugin } = {}) {
  const contacts = await contactRepository.find({
    licensee: licensee._id,
    wa_start_chat: {
      $ne: null,
      $lte: moment().subtract(WINDOW_HOURS, 'hours').toDate(),
    },
  })

  for (const contact of contacts) {
    await clearWaStartChatOnContact(contact, { contactRepository })

    if (licensee.useWhatsappWindow === true) {
      const messageToSend = await messageRepository.createMessageToWarnAboutWindowOfWhatsassHasExpired(
        contact,
        licensee,
      )

      await sendMessageToChat(licensee, messageToSend, { createChatPlugin })
    }
  }
}

async function resetChats({ licenseeRepository, contactRepository, messageRepository, createChatPlugin } = {}) {
  const licensees = await licenseeRepository.find({ active: true, whatsappDefault: 'dialog', useWhatsappWindow: true })
  for (const licensee of licensees) {
    await warningAboutChatsEnding(licensee, { contactRepository, messageRepository, createChatPlugin })
    await warningAboutChatsExpired(licensee, { contactRepository, messageRepository, createChatPlugin })
  }
}

export { resetChats }
