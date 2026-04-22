import { PagarMe } from '../plugins/payments/PagarMe.js'
import { BackgroundjobRepositoryDatabase } from '../repositories/backgroundjob.js'
import { CartRepositoryDatabase } from '../repositories/cart.js'

async function processBackgroundjobCancelOrder(
  data,
  {
    backgroundjobRepository = new BackgroundjobRepositoryDatabase(),
    cartRepository = new CartRepositoryDatabase(),
    pagarMe = new PagarMe(),
  } = {},
) {
  const { jobId, cart_id: cartId } = data

  const backgroundjob = await backgroundjobRepository.findFirst({ _id: jobId })

  try {
    const cart = await cartRepository.findFirst({ _id: cartId })

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

  await backgroundjobRepository.save(backgroundjob)
}

export { processBackgroundjobCancelOrder }
