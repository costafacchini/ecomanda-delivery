async function sendOrder(data: any, { orderRepository, createIntegrator }: Record<string, any> = {}) {
  const { orderId } = data

  const order = await orderRepository.findFirst({ _id: orderId }, ['licensee'])

  const integrator = createIntegrator(order.licensee.pedidos10_integrator)
  try {
    await integrator.sendOrder(order)
    order.integration_status = 'done'
  } catch (err) {
    order.integration_status = 'error'
    order.integration_error = err.message || 'Erro desconhecido'
  }

  await orderRepository.save(order)
}

export { sendOrder }
