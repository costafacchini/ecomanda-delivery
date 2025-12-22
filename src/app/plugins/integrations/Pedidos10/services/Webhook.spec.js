import { Webhook } from './Webhook.js'
import Licensee from '@models/Licensee'
import Integrationlog from '@models/Integrationlog'
import mongoServer from '../../../../../../.jest/utils'
import { licenseePedidos10 as licenseeFactory } from '@factories/licensee'
import request from '../../../../services/request.js'
import { logger } from '../../../../../setup/logger.js'

jest.mock('../../../../services/request')
jest.mock('../../../../../setup/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  },
}))

describe('Pedidos10/Webhook plugin', () => {
  let licensee

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
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

        request.put.mockResolvedValueOnce({
          status: 200,
          data: '',
        })

        const webhook = new Webhook(licensee)
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

        const webhook = new Webhook(licensee)
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

        const webhook = new Webhook(licensee)
        await webhook.sign()
        expect(logger.error).toHaveBeenCalledWith(
          `Não foi possível assinar o webhook de pedidos do Pedidos 10
           status: 422
           log_id: 1234`,
          {
            message: 'The request is invalid.',
            errors: {
              'customer.automaticanticipationsettings.type': [
                "The type field is invalid. Possible values are 'full','1025'",
              ],
            },
          },
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

        const webhook = new Webhook(licensee)
        await webhook.sign()
        const integrationlog = await Integrationlog.findOne({ licensee: licensee._id })
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })
})
