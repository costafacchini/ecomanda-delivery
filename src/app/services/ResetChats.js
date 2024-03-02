const createChatPlugin = require('../plugins/chats/factory')
const moment = require('moment-timezone')
const {
  createMessageToWarnAboutWindowOfWhatsassIsEnding,
  createMessageToWarnAboutWindowOfWhatsassHasExpired,
} = require('@repositories/message')
const { ContactRepositoryDatabase } = require('@repositories/contact')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')
const ContactsQuery = require('@queries/ContactsQuery')

async function sendMessageToChat(licensee, messageToSend) {
  const chatPlugin = createChatPlugin(licensee)

  await chatPlugin.sendMessage(messageToSend._id, licensee.chatUrl)
}

async function clearWaStartChatOnContact(contact) {
  const contactRepository = new ContactRepositoryDatabase()
  await contactRepository.update(contact._id, { wa_start_chat: null })

  return
}

async function warningAboutChatsEnding(licensee) {
  if (!licensee.useWhatsappWindow === true) return
  const contactsQuery = new ContactsQuery()
  contactsQuery.filterByLicensee(licensee)
  contactsQuery.filterIntervalWaStartChat(
    moment().subtract(24, 'hours').toDate(),
    moment().subtract(23, 'hours').subtract(50, 'minutes').toDate(),
  )

  const contacts = await contactsQuery.all()
  for (const contact of contacts) {
    const messageToSend = await createMessageToWarnAboutWindowOfWhatsassIsEnding(contact, licensee)

    await sendMessageToChat(licensee, messageToSend)
  }
}

async function warningAboutChatsExpired(licensee) {
  const contactsQuery = new ContactsQuery()
  contactsQuery.filterByLicensee(licensee)
  contactsQuery.filterWaStartChatLessThan(moment().subtract(24, 'hours').toDate())

  const contacts = await contactsQuery.all()
  for (const contact of contacts) {
    await clearWaStartChatOnContact(contact)

    if (licensee.useWhatsappWindow === true) {
      const messageToSend = await createMessageToWarnAboutWindowOfWhatsassHasExpired(contact, licensee)

      await sendMessageToChat(licensee, messageToSend)
    }
  }
}

async function resetChats() {
  const licenseeRepository = new LicenseeRepositoryDatabase()
  const licensees = await licenseeRepository.find({ active: true, whatsappDefault: 'dialog', useWhatsappWindow: true })
  for (const licensee of licensees) {
    await warningAboutChatsEnding(licensee)
    await warningAboutChatsExpired(licensee)
  }
}

module.exports = resetChats
