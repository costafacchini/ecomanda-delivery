const Contact = require('@models/Contact')
const NormalizePhone = require('@helpers/NormalizePhone')
const { sanitizeModelErrors } = require('@helpers/SanitizeErrors')

async function importContact(chatRef, name, chatBot, licensee) {
  const normalizePhone = new NormalizePhone(chatRef)

  let contact = await Contact.findOne({
    number: normalizePhone.number,
    type: normalizePhone.type,
    licensee: licensee._id,
  })

  if (!contact) {
    contact = new Contact({
      name: name,
      number: normalizePhone.number,
      type: normalizePhone.type,
      talkingWithChatBot: chatBot !== 'chat',
      licensee: licensee._id,
    })
  }

  const validation = contact.validateSync()
  if (validation) {
    return {
      success: false,
      error: `Contato não importado: ${name} - ${normalizePhone.number} motivo: ${JSON.stringify(
        sanitizeModelErrors(validation.errors)
      )}`,
    }
  } else {
    await contact.save()

    return {
      success: true,
      contact,
    }
  }
}

module.exports = importContact
