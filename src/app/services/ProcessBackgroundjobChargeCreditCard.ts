async function processBackgroundjobChargeCreditCard(
  data: any,
  { backgroundjobRepository, cartRepository, contactRepository, createPagarMe }: Record<string, any> = {},
) {
  const { jobId, credit_card_data, cart_id: cartId } = data

  const backgroundjob = await backgroundjobRepository.findFirst({ _id: jobId }, ['licensee'])

  try {
    const cart = await cartRepository.findFirst({ _id: cartId }, ['contact'])
    const contact = await contactRepository.findFirst({ _id: cart.contact })
    const pagarMe = createPagarMe(backgroundjob.licensee)
    const card = contact.credit_cards.find(
      (card: any) =>
        card.first_six_digits == credit_card_data.first_six_digits &&
        card.last_four_digits == credit_card_data.last_four_digits &&
        card.brand == credit_card_data.brand,
    )

    if (card) {
      contact.credit_card_id = card.credit_card_id
      await contactRepository.save(contact)
    } else {
      throw new Error(
        `O cartão ${credit_card_data.first_six_digits}******${credit_card_data.last_four_digits} não consta nos dados de ${contact.name} ${contact.number}!`,
      )
    }

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

  await backgroundjobRepository.save(backgroundjob)
}

export { processBackgroundjobChargeCreditCard }
