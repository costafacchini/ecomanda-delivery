const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const createChatbotPlugin = require('../plugins/chatbots/factory')
const moment = require('moment-timezone')
const MessagesQuery = require('@queries/MessagesQuery')

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
      }
    }
  }
}

module.exports = resetChatbots
