import Body from '@models/Body'
import Pedidos10 from '../plugins/integrations/Pedidos10'

async function processWebhook(data) {
  const { bodyId } = data
  const body = await Body.findById(bodyId).populate('licensee')

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

export default processWebhook
