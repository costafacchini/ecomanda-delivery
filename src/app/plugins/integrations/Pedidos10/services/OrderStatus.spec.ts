import { OrderStatus } from './OrderStatus'
import Licensee from '@models/Licensee'
import Integrationlog from '@models/Integrationlog'
import { installMemoryRepositories, resetMemoryRepositories } from '@repositories/testing'
import { licenseePedidos10 as licenseeFactory } from '@factories/licensee'
import request from '../../../../services/request'
import { createRuntimeDependencies } from '../../../../runtime/dependencies'

jest.mock('../../../../services/request')
jest.mock('../../../../helpers/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn(), fatal: jest.fn() },
}))
import { logger } from '../../../../helpers/logger'

describe('Pedidos10/OrderStatus plugin', () => {
  let licensee
  let dependencies
  const buildOrderStatus = (licensee) =>
    new OrderStatus(licensee, { integrationlogRepository: dependencies.integrationlogRepository })

  beforeEach(async () => {
    installMemoryRepositories()
    jest.clearAllMocks()
    dependencies = createRuntimeDependencies()
    licensee = await Licensee.create(licenseeFactory.build())
    licensee.pedidos10_integration = {
      access_token: 'access-token',
    }
  })

  afterEach(() => {
    resetMemoryRepositories()
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

        request.post.mockResolvedValueOnce({
          status: 200,
          data: '',
        })

        const orderStatus = buildOrderStatus(licensee)
        await orderStatus.change('order-id', 'delivered')
        expect(logger.info).toHaveBeenCalledWith('Status do pedido order-id atualizado para delivered! log_id: 1234')

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const expectedBody = {
          orderId: 'order-id',
          status: 'delivered',
          observation: '',
        }

        request.post.mockResolvedValueOnce({
          status: 200,
          data: '',
        })

        const orderStatus = buildOrderStatus(licensee)
        await orderStatus.change('order-id', 'delivered')
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

        request.post.mockResolvedValueOnce({
          status: 422,
          data: {
            message: 'The request is invalid.',
            errors: {
              'customer.automaticanticipationsettings.type': [
                "The type field is invalid. Possible values are 'full','1025'",
              ],
            },
          },
        })

        const statusOrder = buildOrderStatus(licensee)
        await statusOrder.change('order-id', 'delivered')
        expect(logger.error).toHaveBeenCalledWith(
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

        request.post.mockResolvedValueOnce({
          status: 422,
          data: bodyResponse,
        })

        const orderStatus = buildOrderStatus(licensee)
        await orderStatus.change('order-id', 'delivered')
        const integrationlog = await Integrationlog.findOne({ licensee: licensee._id })
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })
})
