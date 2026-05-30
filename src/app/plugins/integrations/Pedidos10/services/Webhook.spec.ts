import { Webhook } from './Webhook'
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

describe('Pedidos10/Webhook plugin', () => {
  let licensee
  let dependencies
  const buildWebhook = (licensee) =>
    new Webhook(licensee, { integrationlogRepository: dependencies.integrationlogRepository })

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

        request.put.mockResolvedValueOnce({
          status: 200,
          data: '',
        })

        const webhook = buildWebhook(licensee)
        await webhook.sign()
        expect(logger.info).toHaveBeenCalledWith('Webhook do Pedidos 10 assinado com sucesso! log_id: 1234')

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const expectedBody = {
          urlWebhook: `https://clave-digital.herokuapp.com/api/v1/orders?token=${licensee.apiToken}`,
          merchantExternalCode: licensee._id.toString(),
        }

        request.put.mockResolvedValueOnce({
          status: 200,
          data: '',
        })

        const webhook = buildWebhook(licensee)
        await webhook.sign()
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

        request.put.mockResolvedValueOnce({
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

        const webhook = buildWebhook(licensee)
        await webhook.sign()
        expect(logger.error).toHaveBeenCalledWith(
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

        request.put.mockResolvedValueOnce({
          status: 422,
          data: bodyResponse,
        })

        const webhook = buildWebhook(licensee)
        await webhook.sign()
        const integrationlog = await Integrationlog.findOne({ licensee: licensee._id })
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })
})
