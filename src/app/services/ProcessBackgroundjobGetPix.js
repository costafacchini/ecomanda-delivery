const Backgroundjob = require('@models/Backgroundjob')
const PagarMe = require('@plugins/payments/PagarMe')
const { CartRepositoryDatabase } = require('@repositories/cart')

async function processBackgroundjobGetPix(data) {
  const { jobId, cart_id: cartId } = data

  const backgroundjob = await Backgroundjob.findById(jobId)

  try {
    const cartRepository = new CartRepositoryDatabase()
    const cart = await cartRepository.findFirst({ _id: cartId })

    const pagarMe = new PagarMe()
    await pagarMe.payment.createPIX(cart, process.env.PAGARME_TOKEN)

    const cartUpdated = await cartRepository.findFirst({ _id: cartId })

    backgroundjob.status = 'done'
    backgroundjob.response = {
      qrcode: cartUpdated.pix_qrcode,
      qrcode_img_url: cartUpdated.pix_url,
    }
  } catch (error) {
    backgroundjob.status = 'error'
    backgroundjob.error = error.toString()
  }

  await backgroundjob.save()
}

module.exports = processBackgroundjobGetPix
