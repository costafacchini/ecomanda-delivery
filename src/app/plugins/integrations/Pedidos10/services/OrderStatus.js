import Integrationlog from '../../../../models/Integrationlog.js'
import request from '../../../../services/request.js'

class OrderStatus {
  constructor(licensee) {
    this.licensee = licensee
  }

  async change(orderId, status) {
    const body = {
      orderId: orderId,
      status: status,
      observation: '',
    }

    const headers = {
      Accept: 'application/json',
      Authorization: this.licensee.pedidos10_integration.access_token,
    }

    const response = await request.post('https://extranet.pedidos10.com.br/api-integracao-V1/order-status/', {
      headers,
      body,
    })

    const integrationlog = await Integrationlog.create({
      licensee: this.licensee,
      log_payload: response.data,
    })

    if (response.status === 200) {
      console.info(`Status do pedido ${orderId} atualizado para ${status}! log_id: ${integrationlog._id}`)
    } else {
      console.error(
        `Não foi possível alterar o status do pedido no Pedidos 10
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}
           log_id: ${integrationlog._id}`,
      )
    }
  }
}

export { OrderStatus }
