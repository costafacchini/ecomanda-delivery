import OrderStatus from './OrderStatus'
import Licensee from '@models/Licensee'
import Integrationlog from '@models/Integrationlog'
import fetchMock from 'fetch-mock'
import mongoServer from '../../../../../../.jest/utils'
import { licenseePedidos10 as licenseeFactory } from '@factories/licensee'

describe('Pedidos10/OrderStatus plugin', () => {
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

  describe('#change', () => {
    describe('when success', () => {
      it('change order status on Pedidos 10', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const expectedBody = {
          orderId: 'order-id',
          status: 'delivered',
          observation: '',
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://extranet.pedidos10.com.br/api-integracao-V1/order-status/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Accept'] === 'application/json' &&
              headers['Authorization'] === 'access-token'
            )
          },
          {
            status: 200,
          },
        )

        const orderStatus = new OrderStatus(licensee)
        await orderStatus.change('order-id', 'delivered')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleInfoSpy).toHaveBeenCalledWith('Status do pedido order-id atualizado para delivered! log_id: 1234')

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const expectedBody = {
          orderId: 'order-id',
          status: 'delivered',
          observation: '',
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://extranet.pedidos10.com.br/api-integracao-V1/order-status/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Accept'] === 'application/json' &&
              headers['Authorization'] === 'access-token'
            )
          },
          {
            status: 200,
          },
        )

        const orderStatus = new OrderStatus(licensee)
        await orderStatus.change('order-id', 'delivered')
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
          orderId: 'order-id',
          status: 'delivered',
          observation: '',
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://extranet.pedidos10.com.br/api-integracao-V1/order-status/' &&
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

        const statusOrder = new OrderStatus(licensee)
        await statusOrder.change('order-id', 'delivered')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Não foi possível alterar o status do pedido no Pedidos 10
           status: 422
           mensagem: {"message":"The request is invalid.","errors":{"customer.automaticanticipationsettings.type":["The type field is invalid. Possible values are 'full','1025'"]}}
           log_id: 1234`,
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const expectedBody = {
          orderId: 'order-id',
          status: 'delivered',
          observation: '',
        }

        const bodyResponse = {
          message: 'The request is invalid.',
          errors: {
            'customer.automaticanticipationsettings.type': [
              "The type field is invalid. Possible values are 'full','1025'",
            ],
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://extranet.pedidos10.com.br/api-integracao-V1/order-status/' &&
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

        const orderStatus = new OrderStatus(licensee)
        await orderStatus.change('order-id', 'delivered')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const integrationlog = await Integrationlog.findOne({ licensee: licensee._id })
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })
})
