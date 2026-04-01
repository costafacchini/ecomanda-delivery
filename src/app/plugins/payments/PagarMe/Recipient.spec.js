import { Recipient } from './Recipient.js'
import Integrationlog from '@models/Integrationlog'
import mongoServer from '../../../../../.jest/utils'
import { licenseeIntegrationPagarMe as licenseeFactory } from '@factories/licensee'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import request from '../../../services/request.js'
import { logger } from '../../../../setup/logger.js'

jest.mock('../../../services/request')
jest.mock('../../../../setup/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  },
}))

describe('PagarMe/Recipient plugin', () => {
  let licensee

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#create', () => {
    describe('when success', () => {
      it('creates a recipient on PagarMe API', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        request.post.mockResolvedValueOnce({
          status: 200,
          data: {
            id: 23717165,
            name: 'Alcateia Ltds',
            status: '',
            default_bank_account: {
              id: 345345,
              status: '',
            },
          },
        })

        const recipient = new Recipient()
        await recipient.create(licensee, 'token')
        expect(logger.info).toHaveBeenCalledWith(
          'Licenciado Alcateia Ltds criado na pagar.me! id: 23717165 log_id: 1234',
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('saves the recipient id on licensee', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        request.post.mockResolvedValueOnce({
          status: 200,
          data: {
            id: 23717165,
            name: 'Alcateia Ltds',
            status: '',
            default_bank_account: {
              id: 345345,
              status: '',
            },
          },
        })

        const recipient = new Recipient()
        await recipient.create(licensee, 'token')
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licenseeUpdated = await licenseeRepository.findFirst({ _id: licensee._id })
        expect(licenseeUpdated.recipient_id).toEqual('23717165')

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const bodyResponse = {
          id: 23717165,
          name: 'Alcateia Ltds',
          status: '',
          default_bank_account: {
            id: 345345,
            status: '',
          },
        }

        request.post.mockResolvedValueOnce({
          status: 200,
          data: bodyResponse,
        })

        const recipient = new Recipient()
        await recipient.create(licensee, 'token')
        const integrationlog = await Integrationlog.findOne({ licensee: licensee._id })
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })

    describe('when error', () => {
      it('logs the error message', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        request.post.mockResolvedValueOnce({
          status: 400,
          data: {
            message: 'The request is invalid.',
            errors: {
              'recipient.automaticanticipationsettings.type': [
                "The type field is invalid. Possible values are 'full','1025'",
              ],
            },
          },
        })

        const recipient = new Recipient()
        await recipient.create(licensee, 'token')
        expect(logger.error).toHaveBeenCalledWith(
          `Licenciado Alcateia Ltds não criado na pagar.me.
           status: 400
           log_id: 1234`,
          {
            message: 'The request is invalid.',
            errors: {
              'recipient.automaticanticipationsettings.type': [
                "The type field is invalid. Possible values are 'full','1025'",
              ],
            },
          },
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const bodyResponse = {
          message: 'The request is invalid.',
          errors: {
            'recipient.automaticanticipationsettings.type': [
              "The type field is invalid. Possible values are 'full','1025'",
            ],
          },
        }

        request.post.mockResolvedValueOnce({
          status: 400,
          data: bodyResponse,
        })

        const recipient = new Recipient()
        await recipient.create(licensee, 'token')
        const integrationlog = await Integrationlog.findOne({ licensee: licensee._id })
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })

  describe('#update', () => {
    describe('when success', () => {
      it('updates a recipient on PagarMe API', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        request.put.mockResolvedValueOnce({
          status: 200,
          data: {
            id: 23717165,
          },
        })

        const recipient = new Recipient()
        licensee.recipient_id = '98765'
        await recipient.update(licensee, 'token')
        expect(logger.info).toHaveBeenCalledWith(
          'Licenciado Alcateia Ltds atualizado na pagar.me! id: 98765 log_id: 1234',
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const bodyResponse = {
          id: 23717165,
        }

        request.put.mockResolvedValueOnce({
          status: 200,
          data: bodyResponse,
        })

        const recipient = new Recipient()
        licensee.recipient_id = '98765'
        await recipient.update(licensee, 'token')
        const integrationlog = await Integrationlog.findOne({ licensee: licensee._id })
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })

    describe('when error', () => {
      it('logs the error message', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        request.put.mockResolvedValueOnce({
          status: 400,
          data: {
            message: 'The request is invalid.',
            errors: {
              'recipient.automaticanticipationsettings.type': [
                "The type field is invalid. Possible values are 'full','1025'",
              ],
            },
          },
        })

        const recipient = new Recipient()
        licensee.recipient_id = '98765'
        await recipient.update(licensee, 'token')
        expect(logger.error).toHaveBeenCalledWith(
          `Licenciado Alcateia Ltds não atualizado na pagar.me.
           status: 400
           log_id: 1234`,
          {
            message: 'The request is invalid.',
            errors: {
              'recipient.automaticanticipationsettings.type': [
                "The type field is invalid. Possible values are 'full','1025'",
              ],
            },
          },
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const bodyResponse = {
          message: 'The request is invalid.',
          errors: {
            'recipient.automaticanticipationsettings.type': [
              "The type field is invalid. Possible values are 'full','1025'",
            ],
          },
        }

        request.put.mockResolvedValueOnce({
          status: 400,
          data: bodyResponse,
        })

        const recipient = new Recipient()
        licensee.recipient_id = '98765'
        await recipient.update(licensee, 'token')
        const integrationlog = await Integrationlog.findOne({ licensee: licensee._id })
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })
})
