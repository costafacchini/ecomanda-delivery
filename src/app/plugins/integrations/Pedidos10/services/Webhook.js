import Integrationlog from '../../../../models/Integrationlog.js'
import request from '../../../../services/request.js'
import { logger } from '../../../../../setup/logger.js'

class Webhook {
  constructor(licensee) {
    this.licensee = licensee
  }

  async sign() {
    const body = {
      urlWebhook: `https://clave-digital.herokuapp.com/api/v1/orders?token=${this.licensee.apiToken}`,
      merchantExternalCode: this.licensee._id.toString(),
    }

    const headers = {
      Accept: 'application/json',
      Authorization: this.licensee.pedidos10_integration.access_token,
    }

    const response = await request.put('https://extranet.pedidos10.com.br/api-integracao-V1/webhook-order/', {
      headers,
      body,
    })

    const integrationlog = await Integrationlog.create({
      licensee: this.licensee,
      log_payload: response.data,
    })

    if (response.status === 200) {
      logger.info(`Webhook do Pedidos 10 assinado com sucesso! log_id: ${integrationlog._id}`)
    } else {
      logger.error(
        `Não foi possível assinar o webhook de pedidos do Pedidos 10
           status: ${response.status}
           log_id: ${integrationlog._id}`,
        response.data,
      )
    }
  }
}

export { Webhook }
