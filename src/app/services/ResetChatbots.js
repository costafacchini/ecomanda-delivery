const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const Message = require('@models/Message')
const createChatbotPlugin = require('../plugins/chatbots/factory')
const moment = require('moment-timezone')
const MessagesQuery = require('@queries/MessagesQuery')
const { v4: uuidv4 } = require('uuid')
const createMessengerPlugin = require('../plugins/messengers/factory')

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
  const messageToSend = await Message.create({
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
  const licensees = await Licensee.find({ useChatbot: true, chatbotApiToken: { $ne: null } })
  for (const licensee of licensees) {
    const contacts = await Contact.find({ licensee: licensee._id, talkingWithChatBot: true, landbotId: { $ne: null } })
    for (const contact of contacts) {
      const message = await getLastMessageOfContact(contact._id)
      if (message.destination === 'to-messenger' && message.createdAt < getTimeLimit() && message.sended === true) {
        const chatPlugin = createChatbotPlugin(licensee)

        await chatPlugin.dropConversation(message.contact.toString())

        contact.landbotId = null
        await contact.save()

        if (licensee.messageOnResetChatbot && licensee.messageOnResetChatbot !== '') {
          await sendMessageToMessegner(licensee, contact._id, licensee.messageOnResetChatbot)
        }
      }
    }
  }
}

module.exports = resetChatbots
