const Backgroundjob = require('@models/Backgroundjob')
const PagarMe = require('@plugins/payments/PagarMe')
const { CartRepositoryDatabase } = require('@repositories/cart')

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

module.exports = processBackgroundjobCancelOrder
