import Integrationlog from '../../../../models/Integrationlog.js'
import request from '../../../../services/request.js'
import { logger } from '../../../../../setup/logger.js'

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
      logger.info(`Status do pedido ${orderId} atualizado para ${status}! log_id: ${integrationlog._id}`)
    } else {
      logger.error(
        `Não foi possível alterar o status do pedido no Pedidos 10
           status: ${response.status}
           log_id: ${integrationlog._id}`,
        response.data,
      )
    }
  }
}

export { OrderStatus }
