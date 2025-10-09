import Backgroundjob from '@models/Backgroundjob.js'
import { ContactRepositoryDatabase  } from '@repositories/contact.js'
import { CartRepositoryDatabase  } from '@repositories/cart.js'

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

    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.getContactByNumber(backgroundjob.body.contact, licensee._id)

    const cartRepository = new CartRepositoryDatabase()
    const cart = await cartRepository.findFirst({ contact, licensee, concluded: false })

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

export default processBackgroundjob
