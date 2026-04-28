async function sendContactToPagarMe(data, { contactRepository, createPagarMe } = {}) {
  const { contactId } = data

  const contact = await contactRepository.findFirst({ _id: contactId }, ['licensee'])
  const licensee = contact.licensee

  if (!licensee.recipient_id) return

  const pagarMe = createPagarMe(licensee)

  if (contact.customer_id) {
    await pagarMe.customer.update(contact, process.env.PAGARME_TOKEN)
  } else {
    await pagarMe.customer.create(contact, process.env.PAGARME_TOKEN)
  }
}

export { sendContactToPagarMe }
