import Backgroundjob from '@models/Backgroundjob.js'
import PagarMe from '@plugins/payments/PagarMe.js'
import { CartRepositoryDatabase  } from '@repositories/cart.js'
import { ContactRepositoryDatabase  } from '@repositories/contact.js'

async function processBackgroundjobChargeCreditCard(data) {
  const { jobId, credit_card_data, cart_id: cartId } = data

  const backgroundjob = await Backgroundjob.findById(jobId)

  try {
    const cartRepository = new CartRepositoryDatabase()
    const cart = await cartRepository.findFirst({ _id: cartId }, ['contact'])
    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.findFirst({ _id: cart.contact })
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

    const cartUpdated = await cartRepository.findFirst({ _id: cartId })

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

export default processBackgroundjobChargeCreditCard
