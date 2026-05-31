async function changeOrderStatus(
  data: any,
  { bodyRepository, createIntegrator, createPedidos10 }: Record<string, any> = {},
) {
  const { bodyId } = data
  const body = await bodyRepository.findFirst({ _id: bodyId }, ['licensee'])
  const { order, status } = body.content

  const integrator = createIntegrator(body.licensee.pedidos10_integrator)
  const pedidos10Status = integrator.parseStatus(status)

  const pedidos10 = createPedidos10(body.licensee)
  await pedidos10.changeOrderStatus(order, pedidos10Status)
}

export { changeOrderStatus }
