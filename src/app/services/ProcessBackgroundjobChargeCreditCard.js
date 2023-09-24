const Backgroundjob = require('@models/Backgroundjob')
const Cart = require('@models/Cart')
const Contact = require('@models/Contact')
const PagarMe = require('@plugins/payments/PagarMe')

async function processBackgroundjobChargeCreditCard(data) {
  const { jobId, credit_card_data, cart_id: cartId } = data

  const backgroundjob = await Backgroundjob.findById(jobId)

  try {
    const cart = await Cart.findById(cartId).populate('contact')
    const contact = await Contact.findById(cart.contact)
    const card = contact.credit_cards.find(
      (card) =>
        card.first_six_digits == credit_card_data.first_six_digits &&
        card.last_four_digits == credit_card_data.last_four_digits &&
        card.brand == credit_card_data.brand,
    )

    if (card) {
      contact.credit_card_id = card.credit_card_id
      await contact.save()
    } else {
      throw new Error(
        `O cartão ${credit_card_data.first_six_digits}******${credit_card_data.last_four_digits} não consta nos dados de ${contact.name} ${contact.number}!`,
      )
    }

    const pagarMe = new PagarMe()
    await pagarMe.payment.createCreditCard(cart, process.env.PAGARME_TOKEN)

    const cartUpdated = await Cart.findById(cartId)

    if (
      cartUpdated.payment_status == 'not_authorized' ||
      cartUpdated.payment_status == 'failed' ||
      cartUpdated.payment_status == 'with_error' ||
      cartUpdated.payment_status == 'voided'
    )
      throw new Error(`O pagamento não deu certo, retornou com status ${cartUpdated.payment_status}`)

    backgroundjob.status = 'done'
    backgroundjob.response = {
      status: cartUpdated.payment_status,
    }
  } catch (error) {
    backgroundjob.status = 'error'
    backgroundjob.error = error.toString()
  }

  await backgroundjob.save()
}

module.exports = processBackgroundjobChargeCreditCard
