import { Recipient } from './Recipient.js'
import Integrationlog from '@models/Integrationlog'
import fetchMock from 'fetch-mock'
import mongoServer from '../../../../../.jest/utils'
import { licenseeIntegrationPagarMe as licenseeFactory } from '@factories/licensee'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'

describe('PagarMe/Recipient plugin', () => {
  let licensee
  const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation()
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation()

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
    fetchMock.reset()

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

        const expectedBody = {
          name: 'Alcateia Ltds',
          email: 'alcateia@alcateia.com',
          document: '18325187000169',
          type: 'company',
          default_bank_account: {
            holder_name: 'John Doe',
            bank: '001',
            branch_number: '123',
            branch_check_digit: '1',
            account_number: '123456',
            account_check_digit: '2',
            holder_type: 'individual',
            holder_document: '86596393160',
            type: 'checking',
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/recipients/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 200,
            body: {
              id: 23717165,
              name: 'Alcateia Ltds',
              status: '',
              default_bank_account: {
                id: 345345,
                status: '',
              },
            },
          },
        )

        const recipient = new Recipient()
        await recipient.create(licensee, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          'Licenciado Alcateia Ltds criado na pagar.me! id: 23717165 log_id: 1234',
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('saves the recipient id on licensee', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const expectedBody = {
          name: 'Alcateia Ltds',
          email: 'alcateia@alcateia.com',
          document: '18325187000169',
          type: 'company',
          default_bank_account: {
            holder_name: 'John Doe',
            bank: '001',
            branch_number: '123',
            branch_check_digit: '1',
            account_number: '123456',
            account_check_digit: '2',
            holder_type: 'individual',
            holder_document: '86596393160',
            type: 'checking',
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/recipients/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 200,
            body: {
              id: 23717165,
              name: 'Alcateia Ltds',
              status: '',
              default_bank_account: {
                id: 345345,
                status: '',
              },
            },
          },
        )

        const recipient = new Recipient()
        await recipient.create(licensee, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licenseeUpdated = await licenseeRepository.findFirst({ _id: licensee._id })
        expect(licenseeUpdated.recipient_id).toEqual('23717165')

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const expectedBody = {
          name: 'Alcateia Ltds',
          email: 'alcateia@alcateia.com',
          document: '18325187000169',
          type: 'company',
          default_bank_account: {
            holder_name: 'John Doe',
            bank: '001',
            branch_number: '123',
            branch_check_digit: '1',
            account_number: '123456',
            account_check_digit: '2',
            holder_type: 'individual',
            holder_document: '86596393160',
            type: 'checking',
          },
        }

        const bodyResponse = {
          id: 23717165,
          name: 'Alcateia Ltds',
          status: '',
          default_bank_account: {
            id: 345345,
            status: '',
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/recipients/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 200,
            body: bodyResponse,
          },
        )

        const recipient = new Recipient()
        await recipient.create(licensee, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const integrationlog = await Integrationlog.findOne({ licensee: licensee._id })
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })

    describe('when error', () => {
      it('logs the error message', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const expectedBody = {
          name: 'Alcateia Ltds',
          email: 'alcateia@alcateia.com',
          document: '18325187000169',
          type: 'company',
          default_bank_account: {
            holder_name: 'John Doe',
            bank: '001',
            branch_number: '123',
            branch_check_digit: '1',
            account_number: '123456',
            account_check_digit: '2',
            holder_type: 'individual',
            holder_document: '86596393160',
            type: 'checking',
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/recipients/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 400,
            body: {
              message: 'The request is invalid.',
              errors: {
                'recipient.automaticanticipationsettings.type': [
                  "The type field is invalid. Possible values are 'full','1025'",
                ],
              },
            },
          },
        )

        const recipient = new Recipient()
        await recipient.create(licensee, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Licenciado Alcateia Ltds não criado na pagar.me.
           status: 400
           mensagem: {"message":"The request is invalid.","errors":{"recipient.automaticanticipationsettings.type":["The type field is invalid. Possible values are 'full','1025'"]}}
           log_id: 1234`,
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const expectedBody = {
          name: 'Alcateia Ltds',
          email: 'alcateia@alcateia.com',
          document: '18325187000169',
          type: 'company',
          default_bank_account: {
            holder_name: 'John Doe',
            bank: '001',
            branch_number: '123',
            branch_check_digit: '1',
            account_number: '123456',
            account_check_digit: '2',
            holder_type: 'individual',
            holder_document: '86596393160',
            type: 'checking',
          },
        }

        const bodyResponse = {
          message: 'The request is invalid.',
          errors: {
            'recipient.automaticanticipationsettings.type': [
              "The type field is invalid. Possible values are 'full','1025'",
            ],
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/recipients/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 400,
            body: bodyResponse,
          },
        )

        const recipient = new Recipient()
        await recipient.create(licensee, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

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

        const expectedBody = {
          email: 'alcateia@alcateia.com',
          type: 'company',
        }

        fetchMock.putOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/recipients/98765' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 200,
            body: {
              id: 23717165,
            },
          },
        )

        const recipient = new Recipient()
        licensee.recipient_id = '98765'
        await recipient.update(licensee, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          'Licenciado Alcateia Ltds atualizado na pagar.me! id: 98765 log_id: 1234',
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const expectedBody = {
          email: 'alcateia@alcateia.com',
          type: 'company',
        }

        const bodyResponse = {
          id: 23717165,
        }

        fetchMock.putOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/recipients/98765' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 200,
            body: bodyResponse,
          },
        )

        const recipient = new Recipient()
        licensee.recipient_id = '98765'
        await recipient.update(licensee, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const integrationlog = await Integrationlog.findOne({ licensee: licensee._id })
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })

    describe('when error', () => {
      it('logs the error message', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const expectedBody = {
          email: 'alcateia@alcateia.com',
          type: 'company',
        }

        fetchMock.putOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/recipients/98765' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 400,
            body: {
              message: 'The request is invalid.',
              errors: {
                'recipient.automaticanticipationsettings.type': [
                  "The type field is invalid. Possible values are 'full','1025'",
                ],
              },
            },
          },
        )

        const recipient = new Recipient()
        licensee.recipient_id = '98765'
        await recipient.update(licensee, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Licenciado Alcateia Ltds não atualizado na pagar.me.
           status: 400
           mensagem: {"message":"The request is invalid.","errors":{"recipient.automaticanticipationsettings.type":["The type field is invalid. Possible values are 'full','1025'"]}}
           log_id: 1234`,
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const expectedBody = {
          email: 'alcateia@alcateia.com',
          type: 'company',
        }

        const bodyResponse = {
          message: 'The request is invalid.',
          errors: {
            'recipient.automaticanticipationsettings.type': [
              "The type field is invalid. Possible values are 'full','1025'",
            ],
          },
        }

        fetchMock.putOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/recipients/98765' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 400,
            body: bodyResponse,
          },
        )

        const recipient = new Recipient()
        licensee.recipient_id = '98765'
        await recipient.update(licensee, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const integrationlog = await Integrationlog.findOne({ licensee: licensee._id })
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })
})
