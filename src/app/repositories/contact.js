const Contact = require('@models/Contact')
const MessagesQuery = require('@queries/MessagesQuery')
const moment = require('moment-timezone')

async function createContact(fields) {
  const contact = new Contact({
    ...fields,
  })

  return await contact.save()
}

async function getContactBy(filter) {
  return await Contact.findOne(filter)
}

async function contactWithWhatsappWindowClosed(contactId) {
  const messagesQuery = new MessagesQuery()

  messagesQuery.page(1)
  messagesQuery.limit(1)
  messagesQuery.filterByDestination('to-chat')
  messagesQuery.filterByContact(contactId)
  const messages = await messagesQuery.all()

  if (messages.length === 0) return true

  const now = moment.tz(new Date(), 'America/Sao_Paulo')
  const diff = now.diff(moment.tz(messages[0].createdAt, 'America/Sao_Paulo'), 'minutes')
  const twentyFourhoursInMinutes = 24 * 60

  return diff >= twentyFourhoursInMinutes
}

module.exports = { createContact, contactWithWhatsappWindowClosed, getContactBy }
