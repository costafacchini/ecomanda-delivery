import { PagarMe } from '../plugins/payments/PagarMe.js'
import { ContactRepositoryDatabase } from '../repositories/contact.js'

async function sendContactToPagarMe(data) {
  const { contactId } = data

  const contactRepository = new ContactRepositoryDatabase()
  const contact = await contactRepository.findFirst({ _id: contactId }, ['licensee'])
  const licensee = contact.licensee

  if (!licensee.recipient_id) return

  const pagarMe = new PagarMe()
  if (contact.customer_id) {
    await pagarMe.customer.update(contact, process.env.PAGARME_TOKEN)
  } else {
    await pagarMe.customer.create(contact, process.env.PAGARME_TOKEN)
  }
}

export { sendContactToPagarMe }
