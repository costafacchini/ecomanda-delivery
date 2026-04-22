import { Pedidos10 } from '../plugins/integrations/Pedidos10.js'
import { BodyRepositoryDatabase } from '../repositories/body.js'

async function processWebhook(data, { bodyRepository = new BodyRepositoryDatabase() } = {}) {
  const { bodyId } = data
  const body = await bodyRepository.findFirst({ _id: bodyId }, ['licensee'])

  const pedidos10 = new Pedidos10(body.licensee)
  const orderPersisted = await pedidos10.processOrder(body.content)

  const actions = [
    {
      action: `integration-send-order`,
      body: {
        orderId: orderPersisted._id,
      },
    },
  ]

  return actions
}

export { processWebhook }
