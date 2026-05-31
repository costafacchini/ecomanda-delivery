async function processBackgroundjobGetPix(
  data: any,
  { backgroundjobRepository, cartRepository, createPagarMe }: Record<string, any> = {},
) {
  const { jobId, cart_id: cartId } = data

  const backgroundjob = await backgroundjobRepository.findFirst({ _id: jobId }, ['licensee'])

  try {
    const cart = await cartRepository.findFirst({ _id: cartId })
    const pagarMe = createPagarMe(backgroundjob.licensee)

    await pagarMe.payment.createPIX(cart, process.env.PAGARME_TOKEN)

    const cartUpdated = await cartRepository.findFirst({ _id: cartId })

    backgroundjob.status = 'done'
    backgroundjob.response = {
      qrcode: cartUpdated.pix_qrcode,
      qrcode_img_url: cartUpdated.pix_url,
    }
  } catch (error: any) {
    backgroundjob.status = 'error'
    backgroundjob.error = error.toString()
  }

  await backgroundjobRepository.save(backgroundjob)
}

export { processBackgroundjobGetPix }
