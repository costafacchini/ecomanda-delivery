const Recipient = require('./Recipient')
const Licensee = require('@models/Licensee')
const fetchMock = require('fetch-mock')
const mongoServer = require('../../../../../.jest/utils')
const { licenseeIntegrationPagarMe: licenseeFactory } = require('@factories/licensee')

describe('PagarMe/Recipient plugin', () => {
  let licensee
  const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation()
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation()

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
    fetchMock.reset()

    licensee = await Licensee.create(licenseeFactory.build())
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#create', () => {
    describe('when success', () => {
      it('creates a recipient on PagarMe API', async () => {
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
          transfer_settings: {
            enabled: false,
          },
          automatic_anticipation_settings: {
            enabled: false,
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
          }
        )

        const recipient = new Recipient()
        await recipient.create(licensee, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          'Licenciado Alcateia Ltds criado na pagar.me! {"id":23717165,"name":"Alcateia Ltds","status":"","default_bank_account":{"id":345345,"status":""}}'
        )
      })

      it('saves the recipient id on licensee', async () => {
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
          transfer_settings: {
            enabled: false,
          },
          automatic_anticipation_settings: {
            enabled: false,
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
          }
        )

        const recipient = new Recipient()
        await recipient.create(licensee, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const licenseeUpdated = await Licensee.findById(licensee._id)
        expect(licenseeUpdated.recipient_id).toEqual('23717165')
      })
    })

    describe('when error', () => {
      it('logs the error message', async () => {
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
          transfer_settings: {
            enabled: false,
          },
          automatic_anticipation_settings: {
            enabled: false,
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
          }
        )

        const recipient = new Recipient()
        await recipient.create(licensee, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Licenciado Alcateia Ltds não criado na pagar.me.
           status: 400
           mensagem: {"message":"The request is invalid.","errors":{"recipient.automaticanticipationsettings.type":["The type field is invalid. Possible values are 'full','1025'"]}}`
        )
      })
    })
  })

  describe('#update', () => {
    describe('when success', () => {
      it('updates a recipient on PagarMe API', async () => {
        const expectedBody = {
          email: 'alcateia@alcateia.com',
          type: 'company',
        }

        fetchMock.patchOnce(
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
          }
        )

        const recipient = new Recipient()
        licensee.recipient_id = '98765'
        await recipient.update(licensee, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleInfoSpy).toHaveBeenCalledWith('Licenciado Alcateia Ltds atualizado na pagar.me! {"id":23717165}')
      })
    })

    describe('when error', () => {
      it('logs the error message', async () => {
        const expectedBody = {
          email: 'alcateia@alcateia.com',
          type: 'company',
        }

        fetchMock.patchOnce(
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
          }
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
           mensagem: {"message":"The request is invalid.","errors":{"recipient.automaticanticipationsettings.type":["The type field is invalid. Possible values are 'full','1025'"]}}`
        )
      })
    })
  })
})
