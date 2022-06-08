const Contact = require('@models/Contact')

async function createContact(fields) {
  const contact = new Contact({
    ...fields,
  })

  const contactSaved = await contact.save()

  return contactSaved
}

module.exports = { createContact }
