import { PagarMe } from '../plugins/payments/PagarMe.js'
import { ContactRepositoryDatabase } from '../repositories/contact.js'

async function sendContactToPagarMe(
  data,
  { contactRepository = new ContactRepositoryDatabase(), pagarMe = new PagarMe() } = {},
) {
  const { contactId } = data

  const contact = await contactRepository.findFirst({ _id: contactId }, ['licensee'])
  const licensee = contact.licensee

  if (!licensee.recipient_id) return

  if (contact.customer_id) {
    await pagarMe.customer.update(contact, process.env.PAGARME_TOKEN)
  } else {
    await pagarMe.customer.create(contact, process.env.PAGARME_TOKEN)
  }
}

export { sendContactToPagarMe }
