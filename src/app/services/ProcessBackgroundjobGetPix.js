const Backgroundjob = require('@models/Backgroundjob')
const Cart = require('@models/Cart')
const PagarMe = require('@plugins/payments/PagarMe')

async function processBackgroundjobGetPix(data) {
  const { jobId, cart_id: cartId } = data

  const backgroundjob = await Backgroundjob.findById(jobId)

  try {
    const cart = await Cart.findById(cartId)

    const pagarMe = new PagarMe()
    await pagarMe.payment.create(cart, process.env.PAGARME_TOKEN)

    const cartUpdated = await Cart.findById(cartId)

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
