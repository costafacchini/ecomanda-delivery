async function processWebhook(data, { bodyRepository, createPedidos10 } = {}) {
  const { bodyId } = data
  const body = await bodyRepository.findFirst({ _id: bodyId }, ['licensee'])

  const pedidos10 = createPedidos10(body.licensee)
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
