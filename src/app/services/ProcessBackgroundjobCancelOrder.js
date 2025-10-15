import Backgroundjob from '../models/Backgroundjob.js'
import { PagarMe } from '../plugins/payments/PagarMe.js'
import { CartRepositoryDatabase } from '../repositories/cart.js'

async function processBackgroundjobCancelOrder(data) {
  const { jobId, cart_id: cartId } = data

  const backgroundjob = await Backgroundjob.findById(jobId)

  try {
    const cartRepository = new CartRepositoryDatabase()
    const cart = await cartRepository.findFirst({ _id: cartId })

    const pagarMe = new PagarMe()
    await pagarMe.payment.delete(cart, process.env.PAGARME_TOKEN)

    const cartUpdated = await cartRepository.findFirst({ _id: cartId })

    backgroundjob.status = 'done'
    backgroundjob.response = {
      payment_status: cartUpdated.payment_status,
    }
  } catch (error) {
    backgroundjob.status = 'error'
    backgroundjob.error = error.toString()
  }

  await backgroundjob.save()
}

export { processBackgroundjobCancelOrder }
