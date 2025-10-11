import createChatbotPlugin from '../plugins/chatbots/factory'
import moment from 'moment-timezone'
import MessagesQuery from '@queries/MessagesQuery'
import { v4 as uuidv4 } from 'uuid'
import createMessengerPlugin from '../plugins/messengers/factory'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { MessageRepositoryDatabase } from '@repositories/message'

async function getLastMessageOfContact(contactId) {
  const messagesQuery = new MessagesQuery()
  messagesQuery.page(1)
  messagesQuery.limit(1)
  messagesQuery.filterByContact(contactId)

  const messages = await messagesQuery.all()

  return messages[0]
}

function getTimeLimit() {
  return moment().tz('UTC').subtract(1, 'hour')
}

async function sendMessageToMessegner(licensee, contactId, text) {
  const messageRepository = new MessageRepositoryDatabase()
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

async function resetChatbots() {
  const licenseeRepository = new LicenseeRepositoryDatabase()
  const licensees = await licenseeRepository.find({ useChatbot: true, chatbotApiToken: { $ne: null } })
  for (const licensee of licensees) {
    const contactRepository = new ContactRepositoryDatabase()
    const contacts = await contactRepository.find({
      licensee: licensee._id,
      talkingWithChatBot: true,
      landbotId: { $ne: null },
    })
    for (const contact of contacts) {
      const message = await getLastMessageOfContact(contact._id)

      if (!message) continue

      if (message.destination === 'to-messenger' && message.createdAt < getTimeLimit() && message.sended === true) {
        const chatPlugin = createChatbotPlugin(licensee)

        await chatPlugin.dropConversation(message.contact._id.toString())

        contact.landbotId = null
        await contact.save()

        if (licensee.messageOnResetChatbot && licensee.messageOnResetChatbot !== '') {
          await sendMessageToMessegner(licensee, contact._id, licensee.messageOnResetChatbot)
        }
      }
    }
  }
}

export default resetChatbots
