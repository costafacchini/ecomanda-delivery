const Backgroundjob = require('@models/Backgroundjob')
const Cart = require('@models/Cart')
const Contact = require('@models/Contact')
const PagarMe = require('@plugins/payments/PagarMe')

async function processBackgroundjobInviteCreditCard(data) {
  const { jobId, credit_card_data, cart_id: cartId } = data

  const backgroundjob = await Backgroundjob.findById(jobId)

  try {
    const cart = await Cart.findById(cartId).populate('contact')
    const contact = await Contact.findById(cart.contact)

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
