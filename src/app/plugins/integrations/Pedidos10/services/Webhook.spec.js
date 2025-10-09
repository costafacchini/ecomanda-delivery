import Webhook from './Webhook.js'
import Licensee from '@models/Licensee.js'
import Integrationlog from '@models/Integrationlog.js'
import fetchMock from 'fetch-mock'
import mongoServer from '../../../../../../.jest/utils.js'
import { licenseePedidos10 as licenseeFactory   } from '@factories/licensee.js'

describe('Pedidos10/Webhook plugin', () => {
  let licensee
  const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation()
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation()

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
    fetchMock.reset()

    licensee = await Licensee.create(licenseeFactory.build())
    licensee.pedidos10_integration = {
      access_token: 'access-token',
    }
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#sign', () => {
    describe('when success', () => {
      it('sign Pedidos 10 order webhook', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const expectedBody = {
          urlWebhook: `https://clave-digital.herokuapp.com/api/v1/orders?token=${licensee.apiToken}`,
          merchantExternalCode: licensee._id.toString(),
        }

        fetchMock.putOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://extranet.pedidos10.com.br/api-integracao-V1/webhook-order/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Accept'] === 'application/json' &&
              headers['Authorization'] === 'access-token'
            )
          },
          {
            status: 200,
          },
        )

        const webhook = new Webhook(licensee)
        await webhook.sign()
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleInfoSpy).toHaveBeenCalledWith('Webhook do Pedidos 10 assinado com sucesso! log_id: 1234')

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const expectedBody = {
          urlWebhook: `https://clave-digital.herokuapp.com/api/v1/orders?token=${licensee.apiToken}`,
          merchantExternalCode: licensee._id.toString(),
        }

        fetchMock.putOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://extranet.pedidos10.com.br/api-integracao-V1/webhook-order/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Accept'] === 'application/json' &&
              headers['Authorization'] === 'access-token'
            )
          },
          {
            status: 200,
          },
        )

        const webhook = new Webhook(licensee)
        await webhook.sign()
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const integrationlog = await Integrationlog.findOne({ licensee: licensee._id })
        expect(integrationlog.log_payload).toEqual('')
      })
    })

    describe('when error', () => {
      it('logs the error message', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const expectedBody = {
          urlWebhook: `https://clave-digital.herokuapp.com/api/v1/orders?token=${licensee.apiToken}`,
          merchantExternalCode: licensee._id.toString(),
        }

        fetchMock.putOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://extranet.pedidos10.com.br/api-integracao-V1/webhook-order/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Accept'] === 'application/json' &&
              headers['Authorization'] === 'access-token'
            )
          },
          {
            status: 422,
            body: {
              message: 'The request is invalid.',
              errors: {
                'customer.automaticanticipationsettings.type': [
                  "The type field is invalid. Possible values are 'full','1025'",
                ],
              },
            },
          },
        )

        const webhook = new Webhook(licensee)
        await webhook.sign()
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Não foi possível assinar o webhook de pedidos do Pedidos 10
           status: 422
           mensagem: {"message":"The request is invalid.","errors":{"customer.automaticanticipationsettings.type":["The type field is invalid. Possible values are 'full','1025'"]}}
           log_id: 1234`,
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const expectedBody = {
          urlWebhook: `https://clave-digital.herokuapp.com/api/v1/orders?token=${licensee.apiToken}`,
          merchantExternalCode: licensee._id.toString(),
        }

        const bodyResponse = {
          message: 'The request is invalid.',
          errors: {
            'customer.automaticanticipationsettings.type': [
              "The type field is invalid. Possible values are 'full','1025'",
            ],
          },
        }

        fetchMock.putOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://extranet.pedidos10.com.br/api-integracao-V1/webhook-order/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Accept'] === 'application/json' &&
              headers['Authorization'] === 'access-token'
            )
          },
          {
            status: 422,
            body: bodyResponse,
          },
        )

        const webhook = new Webhook(licensee)
        await webhook.sign()
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const integrationlog = await Integrationlog.findOne({ licensee: licensee._id })
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })
})
