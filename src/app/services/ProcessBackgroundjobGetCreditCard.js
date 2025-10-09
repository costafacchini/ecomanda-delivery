import Backgroundjob from '@models/Backgroundjob.js'
import PagarMe from '@plugins/payments/PagarMe.js'
import { ContactRepositoryDatabase  } from '@repositories/contact.js'
import { CartRepositoryDatabase  } from '@repositories/cart.js'

async function processBackgroundjobGetCreditCard(data) {
  const { jobId, cart_id: cartId } = data

  const backgroundjob = await Backgroundjob.findById(jobId)

  try {
    const cartRepository = new CartRepositoryDatabase()
    const cart = await cartRepository.findFirst({ _id: cartId }, ['contact'])

    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.findFirst({ _id: cart.contact })

    const pagarMe = new PagarMe()

    const cardList = await pagarMe.card.list(contact, process.env.PAGARME_TOKEN)
    cardList.forEach((card) => {
      contact.credit_cards.push({
        credit_card_id: card.id,
        first_six_digits: card.first_six_digits,
        last_four_digits: card.last_four_digits,
        brand: card.brand,
      })
    })
    await contact.save()

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

export default processBackgroundjobGetCreditCard
