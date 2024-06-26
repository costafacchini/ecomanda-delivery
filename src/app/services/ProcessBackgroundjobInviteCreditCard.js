const Backgroundjob = require('@models/Backgroundjob')
const PagarMe = require('@plugins/payments/PagarMe')
const { ContactRepositoryDatabase } = require('@repositories/contact')
const { CartRepositoryDatabase } = require('@repositories/cart')

async function processBackgroundjobInviteCreditCard(data) {
  const { jobId, credit_card_data, cart_id: cartId } = data

  const backgroundjob = await Backgroundjob.findById(jobId)

  try {
    const cartRepository = new CartRepositoryDatabase()
    const cart = await cartRepository.findFirst({ _id: cartId }, ['contact'])

    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.findFirst({ _id: cart.contact })

    const pagarMe = new PagarMe()
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

  await backgroundjob.save()
}

module.exports = processBackgroundjobInviteCreditCard
