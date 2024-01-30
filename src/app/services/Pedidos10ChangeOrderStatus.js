const Body = require('@models/Body')
const Pedidos10 = require('../plugins/integrations/Pedidos10')

async function changeOrderStatus(data) {
  const { bodyId } = data
  const body = await Body.findById(bodyId).populate('licensee')
  const { order, status } = body.content

  const pedidos10 = new Pedidos10(body.licensee)
  // TODO - tem que transformar o status do pedido antes de enviar e salvar o novo status no banco de dados
  await pedidos10.changeOrderStatus(order, status)
}

module.exports = changeOrderStatus
