import request from '../../../../services/request.js'
import { IntegrationlogRepositoryDatabase } from '../../../../repositories/integrationlog.js'
import { LicenseeRepositoryDatabase } from '../../../../repositories/licensee.js'

class Auth {
  constructor(
    licensee,
    {
      integrationlogRepository = new IntegrationlogRepositoryDatabase(),
      licenseeRepository = new LicenseeRepositoryDatabase(),
    } = {},
  ) {
    this.licensee = licensee
    this.integrationlogRepository = integrationlogRepository
    this.licenseeRepository = licenseeRepository
  }

  async login() {
    const body = {
      integration_token: this.licensee.pedidos10_integration.integration_token,
      username: this.licensee.pedidos10_integration.username,
      password: this.licensee.pedidos10_integration.password,
    }

    const headers = {
      Accept: 'application/json',
    }

    const response = await request.post('https://extranet.pedidos10.com.br/api-integracao-V1/auth/', { headers, body })

    const integrationlog = await this.integrationlogRepository.create({
      licensee: this.licensee,
      log_payload: response.data,
    })

    if (response.status === 200) {
      this.licensee.pedidos10_integration = {
        ...this.licensee.pedidos10_integration,
        access_token: response.data.data.access_token,
        authenticated: true,
      }

      await this.licenseeRepository.save(this.licensee)

      console.info(`Login efetuado na API do Pedidos 10! log_id: ${integrationlog._id}`)
    } else {
      this.licensee.pedidos10_integration.authenticated = false
      await this.licenseeRepository.save(this.licensee)

      console.error(
        `Não foi possível fazer a autenticação na API do Pedidos 10
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}
           log_id: ${integrationlog._id}`,
      )
    }

    return response.status === 200
  }
}

export { Auth }
