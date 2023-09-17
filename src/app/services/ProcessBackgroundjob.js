const Backgroundjob = require('@models/Backgroundjob')
const { getContactByNumber } = require('@repositories/contact')
const { getCartBy } = require('@repositories/cart')

async function processBackgroundjob(data) {
  const { jobId } = data
  const backgroundjob = await Backgroundjob.findById(jobId).populate('licensee')

  const body = { ...backgroundjob.body, jobId }

  if (!backgroundjob.body.cart_id && !backgroundjob.body.contact) {
    backgroundjob.status = 'error'
    backgroundjob.error = 'O job precisa ter ou um contato ou um carrinho válido!'

    await backgroundjob.save()

    return
  }

  if (!backgroundjob.body.cart_id && backgroundjob.body.contact) {
    const licensee = backgroundjob.licensee
    const contact = await getContactByNumber(backgroundjob.body.contact, licensee._id)
    const cart = await getCartBy({ contact, licensee, concluded: false })

    if (!cart) {
      backgroundjob.status = 'error'
      backgroundjob.error = 'O job precisa ter ou um contato ou um carrinho válido!'

      await backgroundjob.save()

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

module.exports = processBackgroundjob
