async function processBackgroundjobInviteCreditCard(
  data,
  { backgroundjobRepository, contactRepository, cartRepository, createPagarMe }: Record<string, any> = {},
) {
  const { jobId, credit_card_data, cart_id: cartId } = data

  const backgroundjob = await backgroundjobRepository.findFirst({ _id: jobId }, ['licensee'])

  try {
    const cart = await cartRepository.findFirst({ _id: cartId }, ['contact'])

    const contact = await contactRepository.findFirst({ _id: cart.contact })
    const pagarMe = createPagarMe(backgroundjob.licensee)

    const response = await pagarMe.card.create(contact, credit_card_data, process.env.PAGARME_TOKEN)

    if (!response.success) throw new Error(`O cadastro do cartão não deu certo ${response.error}`)

    backgroundjob.status = 'done'
    backgroundjob.response = {
      status: 'done',
    }
  } catch (error) {
    backgroundjob.status = 'error'
    backgroundjob.error = error.toString()
  }

  await backgroundjobRepository.save(backgroundjob)
}

export { processBackgroundjobInviteCreditCard }
