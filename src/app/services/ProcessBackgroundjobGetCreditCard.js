const Backgroundjob = require('@models/Backgroundjob')
const Cart = require('@models/Cart')
const PagarMe = require('@plugins/payments/PagarMe')

async function processBackgroundjobGetCreditCard(data) {
  const { jobId, cart_id: cartId } = data

  const backgroundjob = await Backgroundjob.findById(jobId)

  try {
    const cart = await Cart.findById(cartId).populate('contact')
    const contact = cart.contact

    const pagarMe = new PagarMe()

    const cardList = await pagarMe.card.list(contact, process.env.PAGARME_TOKEN)
    const cardData = cardList.map((card) => {
      const last_card_used = contact.credit_card_id && contact.credit_card_id == card.id

      return {
        first_six_digits: card.first_six_digits,
        last_four_digits: card.last_four_digits,
        brand: card.brand,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        type: card.type,
        last_card_used,
      }
    })

    backgroundjob.status = 'done'
    backgroundjob.response = {
      credit_card_data: cardData,
    }
  } catch (error) {
    backgroundjob.status = 'error'
    backgroundjob.error = error.toString()
  }

  await backgroundjob.save()
}

module.exports = processBackgroundjobGetCreditCard
