const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const createChatPlugin = require('../plugins/chats/factory')
const moment = require('moment-timezone')
const {
  createMessageToWarnAboutWindowOfWhatsassIsEnding,
  createMessageToWarnAboutWindowOfWhatsassHasExpired,
} = require('@repositories/message')
const { getContactBy } = require('@repositories/contact')

async function sendMessageToChat(licensee, messageToSend) {
  const chatPlugin = createChatPlugin(licensee)

  await chatPlugin.sendMessage(messageToSend._id, licensee.chatUrl)
}

async function clearWaStartChatOnContact(contact) {
  const contactToUpdate = await getContactBy({ _id: contact._id })
  contactToUpdate.wa_start_chat = null

  return await contact.save()
}

async function warningAboutChatsEnding(licensee) {
  let query = Contact.find({})
  query = query
    .where('licensee', licensee)
    .where('wa_start_chat')
    .gt(moment().subtract(24, 'hours').toDate())
    .lt(moment().subtract(23, 'hours').subtract(50, 'minutes').toDate())

  const contacts = await query.exec()
  for (const contact of contacts) {
    const messageToSend = await createMessageToWarnAboutWindowOfWhatsassIsEnding(contact, licensee)

    await sendMessageToChat(licensee, messageToSend)
  }
}

async function warningAboutChatsExpired(licensee) {
  let query = Contact.find({})
  query = query.where('licensee', licensee).where('wa_start_chat').lt(moment().subtract(24, 'hours').toDate())

  const contacts = await query.exec()
  for (const contact of contacts) {
    const messageToSend = await createMessageToWarnAboutWindowOfWhatsassHasExpired(contact, licensee)

    await clearWaStartChatOnContact(contact)

    await sendMessageToChat(licensee, messageToSend)
  }
}

async function resetChats() {
  const licensees = await Licensee.find({ active: true, whatsappDefault: 'dialog', useWhatsappWindow: true })
  for (const licensee of licensees) {
    await warningAboutChatsEnding(licensee)
    await warningAboutChatsExpired(licensee)
  }
}

module.exports = resetChats