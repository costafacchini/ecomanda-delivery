import { createChatbotPlugin } from '../plugins/chatbots/factory.js'
import moment from 'moment-timezone'
import { v4 as uuidv4 } from 'uuid'
import { createMessengerPlugin } from '../plugins/messengers/factory.js'
import { LicenseeRepositoryDatabase } from '../repositories/licensee.js'
import { ContactRepositoryDatabase } from '../repositories/contact.js'
import { MessageRepositoryDatabase } from '../repositories/message.js'
import { sortRecords } from '../repositories/repository.js'

const ONE_HOUR = 1
const TO_MESSENGER = 'to-messenger'

async function getLastMessageOfContact(contactId, { messageRepository = new MessageRepositoryDatabase() } = {}) {
  const messages = sortRecords(
    await messageRepository.find({
      contact: contactId,
      destination: TO_MESSENGER,
    }),
    { createdAt: 'desc' },
  )

  return messages[0]
}

function getTimeLimit() {
  return moment().tz('UTC').subtract(ONE_HOUR, 'hour')
}

async function sendMessageToMessegner(
  licensee,
  contactId,
  text,
  { messageRepository = new MessageRepositoryDatabase() } = {},
) {
  const messageToSend = await messageRepository.create({
    number: uuidv4(),
    text: text,
    kind: 'text',
    licensee: licensee._id,
    contact: contactId,
    destination: 'to-messenger',
  })

  const messegnerPlugin = createMessengerPlugin(licensee)

  await messegnerPlugin.sendMessage(messageToSend._id.toString(), licensee.whatsappUrl, licensee.whatsappToken)
}

async function resetChatbots({
  licenseeRepository = new LicenseeRepositoryDatabase(),
  contactRepository = new ContactRepositoryDatabase(),
  messageRepository = new MessageRepositoryDatabase(),
} = {}) {
  const licensees = await licenseeRepository.find({ useChatbot: true, chatbotApiToken: { $ne: null } })
  for (const licensee of licensees) {
    const contacts = (
      await contactRepository.find({
        licensee: licensee._id,
        talkingWithChatBot: true,
      })
    ).filter((contact) => contact.landbotId != null)

    for (const contact of contacts) {
      const message = await getLastMessageOfContact(contact._id, { messageRepository })

      if (!message) continue

      if (message.destination === TO_MESSENGER && message.createdAt < getTimeLimit() && message.sended === true) {
        const chatPlugin = createChatbotPlugin(licensee)

        await chatPlugin.dropConversation(contact._id.toString())

        contact.landbotId = null
        await contactRepository.save(contact)

        if (licensee.messageOnResetChatbot && licensee.messageOnResetChatbot !== '') {
          await sendMessageToMessegner(licensee, contact._id, licensee.messageOnResetChatbot, {
            messageRepository,
          })
        }
      }
    }
  }
}

export { resetChatbots }
