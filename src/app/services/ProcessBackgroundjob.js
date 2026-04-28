async function processBackgroundjob(data, { backgroundjobRepository, contactRepository, cartRepository } = {}) {
  const { jobId } = data
  const backgroundjob = await backgroundjobRepository.findFirst({ _id: jobId }, ['licensee'])

  const body = { ...backgroundjob.body, jobId }

  if (!backgroundjob.body.cart_id && !backgroundjob.body.contact) {
    backgroundjob.status = 'error'
    backgroundjob.error = 'O job precisa ter ou um contato ou um carrinho válido!'

    await backgroundjobRepository.save(backgroundjob)

    return
  }

  if (!backgroundjob.body.cart_id && backgroundjob.body.contact) {
    const licensee = backgroundjob.licensee

    const contact = await contactRepository.getContactByNumber(backgroundjob.body.contact, licensee._id)

    const cart = await cartRepository.findFirst({ contact, licensee, concluded: false })

    if (!cart) {
      backgroundjob.status = 'error'
      backgroundjob.error = 'O job precisa ter ou um contato ou um carrinho válido!'

      await backgroundjobRepository.save(backgroundjob)

      return
    }

    body.cart_id = cart._id
  }

  const actions = [
    {
      action: `process-backgroundjob-${backgroundjob.kind}`,
      body,
    },
  ]

  return actions
}

export { processBackgroundjob }
