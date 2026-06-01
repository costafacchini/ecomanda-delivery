import request from '../../../../services/request'
import { logger } from '../../../../helpers/logger'

class OrderStatus {
  licensee: any
  integrationlogRepository: any

  constructor(licensee: any, { integrationlogRepository }: Record<string, any> = {}) {
    this.licensee = licensee
    this.integrationlogRepository = integrationlogRepository
  }

  async change(orderId: any, status: any) {
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

    const integrationlog = await this.integrationlogRepository.create({
      licensee: this.licensee,
      log_payload: response.data,
    })

    if (response.status === 200) {
      logger.info(`Status do pedido ${orderId} atualizado para ${status}! log_id: ${integrationlog._id}`)
    } else {
      logger.error(
        `Não foi possível alterar o status do pedido no Pedidos 10
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}
           log_id: ${integrationlog._id}`,
      )
    }
  }
}

export { OrderStatus }
