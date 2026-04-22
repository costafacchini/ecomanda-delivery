import { PagarMe } from '../plugins/payments/PagarMe.js'
import { BackgroundjobRepositoryDatabase } from '../repositories/backgroundjob.js'
import { ContactRepositoryDatabase } from '../repositories/contact.js'
import { CartRepositoryDatabase } from '../repositories/cart.js'

async function processBackgroundjobInviteCreditCard(
  data,
  {
    backgroundjobRepository = new BackgroundjobRepositoryDatabase(),
    contactRepository = new ContactRepositoryDatabase(),
    cartRepository = new CartRepositoryDatabase(),
    pagarMe = new PagarMe(),
  } = {},
) {
  const { jobId, credit_card_data, cart_id: cartId } = data

  const backgroundjob = await backgroundjobRepository.findFirst({ _id: jobId })

  try {
    const cart = await cartRepository.findFirst({ _id: cartId }, ['contact'])

    const contact = await contactRepository.findFirst({ _id: cart.contact })

    const response = await pagarMe.card.create(contact, credit_card_data, process.env.PAGARME_TOKEN)

    if (!response.success) throw new Error(`O cadastro do cartão não deu certo ${response.error}`)

    backgroundjob.status = 'done'
    backgroundjob.response = {
      status: 'done',
    }
  } catch (error) {
    backgroundjob.status = 'error'
    backgroundjob.error = error.toString()
  }

  await backgroundjobRepository.save(backgroundjob)
}

export { processBackgroundjobInviteCreditCard }
