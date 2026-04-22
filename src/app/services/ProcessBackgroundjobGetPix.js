import { PagarMe } from '../plugins/payments/PagarMe.js'
import { BackgroundjobRepositoryDatabase } from '../repositories/backgroundjob.js'
import { CartRepositoryDatabase } from '../repositories/cart.js'

async function processBackgroundjobGetPix(
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

  await backgroundjobRepository.save(backgroundjob)
}

export { processBackgroundjobGetPix }
