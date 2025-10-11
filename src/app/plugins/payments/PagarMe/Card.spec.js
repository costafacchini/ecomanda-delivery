import Card from './Card'
import Integrationlog from '@models/Integrationlog'
import fetchMock from 'fetch-mock'
import mongoServer from '../../../../../.jest/utils'
import { licenseeIntegrationPagarMe as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'

describe('PagarMe/Card plugin', () => {
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
      it('creates a card to customer on PagarMe API', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '12345',
            licensee,
          }),
        )

        const creditCard = {
          number: '1234123412341234',
          holder_name: 'John Doe',
          expiration_month: 3,
          expiration_year: 25,
          cvv: '111',
        }

        const expectedBody = {
          number: '1234123412341234',
          holder_name: 'John Doe',
          exp_month: 3,
          exp_year: 25,
          cvv: '111',
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/12345/cards' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 200,
            body: {
              id: 'card_3dlyaY6SPSb',
              first_six_digits: '123412',
              last_four_digits: '1234',
              brand: 'Mastercard',
              holder_name: 'John Doe',
              exp_month: 3,
              exp_year: 2025,
              status: 'active',
              type: 'credit',
              created_at: '2023-09-23T13:22:13Z',
              updated_at: '2023-09-23T13:22:13Z',
              customer: {
                id: 'cus_N6g1yG3HwH2y9bXl',
                name: 'Gustavo Macedo',
                email: '5511989187726@mail.com',
                delinquent: false,
                created_at: '2023-09-09T22:03:50Z',
                updated_at: '2023-09-09T22:06:23Z',
                phones: {},
              },
            },
          },
        )

        const card = new Card()
        const response = await card.create(contact, creditCard, 'token')

        expect(response.success).toEqual(true)
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          'Cartão 123412******1234 John Doe criado na pagar.me! id: card_3dlyaY6SPSb log_id: 1234',
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('saves the credir card id on contact', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '12345',
            licensee,
          }),
        )

        const creditCard = {
          number: '1234123412341234',
          holder_name: 'John Doe',
          expiration_month: 3,
          expiration_year: 25,
          cvv: '111',
        }

        const expectedBody = {
          number: '1234123412341234',
          holder_name: 'John Doe',
          exp_month: 3,
          exp_year: 25,
          cvv: '111',
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/12345/cards' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 200,
            body: {
              id: 'card_3dlyaY6SPSb',
              first_six_digits: '123412',
              last_four_digits: '1234',
              brand: 'Mastercard',
              holder_name: 'John Doe',
              exp_month: 3,
              exp_year: 2025,
              status: 'active',
              type: 'credit',
              created_at: '2023-09-23T13:22:13Z',
              updated_at: '2023-09-23T13:22:13Z',
              customer: {
                id: 'cus_N6g1yG3HwH2y9bXl',
                name: 'Gustavo Macedo',
                email: '5511989187726@mail.com',
                delinquent: false,
                created_at: '2023-09-09T22:03:50Z',
                updated_at: '2023-09-09T22:06:23Z',
                phones: {},
              },
            },
          },
        )

        const card = new Card()
        const response = await card.create(contact, creditCard, 'token')

        expect(response.success).toEqual(true)
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const contactUpdated = await contactRepository.findFirst({ _id: contact._id })
        expect(contactUpdated.credit_card_id).toEqual('card_3dlyaY6SPSb')

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '12345',
            licensee,
          }),
        )

        const creditCard = {
          number: '1234123412341234',
          holder_name: 'John Doe',
          expiration_month: 3,
          expiration_year: 25,
          cvv: '111',
        }

        const expectedBody = {
          number: '1234123412341234',
          holder_name: 'John Doe',
          exp_month: 3,
          exp_year: 25,
          cvv: '111',
        }

        const bodyResponse = {
          id: 'card_3dlyaY6SPSb',
          first_six_digits: '123412',
          last_four_digits: '1234',
          brand: 'Mastercard',
          holder_name: 'John Doe',
          exp_month: 3,
          exp_year: 2025,
          status: 'active',
          type: 'credit',
          created_at: '2023-09-23T13:22:13Z',
          updated_at: '2023-09-23T13:22:13Z',
          customer: {
            id: 'cus_N6g1yG3HwH2y9bXl',
            name: 'Gustavo Macedo',
            email: '5511989187726@mail.com',
            delinquent: false,
            created_at: '2023-09-09T22:03:50Z',
            updated_at: '2023-09-09T22:06:23Z',
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/12345/cards' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 200,
            body: bodyResponse,
          },
        )

        const card = new Card()
        const response = await card.create(contact, creditCard, 'token')

        expect(response.success).toEqual(true)
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const integrationlog = await Integrationlog.findOne({ contact: contact._id })
        expect(integrationlog.licensee._id).toEqual(contact.licensee._id)
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })

    describe('when error', () => {
      it('logs the error message', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '12345',
            licensee,
          }),
        )

        const creditCard = {
          number: '1234123412341234',
          holder_name: 'John Doe',
          expiration_month: 3,
          expiration_year: 25,
          cvv: '111',
        }

        const expectedBody = {
          number: '1234123412341234',
          holder_name: 'John Doe',
          exp_month: 3,
          exp_year: 25,
          cvv: '111',
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/12345/cards' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 422,
            body: {
              message: 'The request is invalid.',
              errors: {
                'card.automaticanticipationsettings.type': [
                  "The type field is invalid. Possible values are 'full','1025'",
                ],
              },
            },
          },
        )

        const card = new Card()
        const response = await card.create(contact, creditCard, 'token')

        expect(response.success).toEqual(false)
        expect(response.error).toEqual(
          `Cartão 123412******1234 John Doe não criado na pagar.me.
           status: 422
           mensagem: {"message":"The request is invalid.","errors":{"card.automaticanticipationsettings.type":["The type field is invalid. Possible values are 'full','1025'"]}}
           log_id: 1234`,
        )
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Cartão 123412******1234 John Doe não criado na pagar.me.
           status: 422
           mensagem: {"message":"The request is invalid.","errors":{"card.automaticanticipationsettings.type":["The type field is invalid. Possible values are 'full','1025'"]}}
           log_id: 1234`,
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '12345',
            licensee,
          }),
        )

        const creditCard = {
          number: '1234123412341234',
          holder_name: 'John Doe',
          expiration_month: 3,
          expiration_year: 25,
          cvv: '111',
        }

        const expectedBody = {
          number: '1234123412341234',
          holder_name: 'John Doe',
          exp_month: 3,
          exp_year: 25,
          cvv: '111',
        }

        const bodyResponse = {
          message: 'The request is invalid.',
          errors: {
            'card.automaticanticipationsettings.type': ["The type field is invalid. Possible values are 'full','1025'"],
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/12345/cards' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 422,
            body: bodyResponse,
          },
        )

        const card = new Card()
        const response = await card.create(contact, creditCard, 'token')

        expect(response.success).toEqual(false)
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const integrationlog = await Integrationlog.findOne({ contact: contact._id })
        expect(integrationlog.licensee._id).toEqual(contact.licensee._id)
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })

  describe('#list', () => {
    describe('when success', () => {
      it('returns the customer credit cards', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '12345',
            licensee,
          }),
        )

        fetchMock.getOnce(
          (url, { headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/12345/cards' && headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 200,
            body: {
              data: [
                {
                  id: 'card_3dlyaY6SPSb',
                  first_six_digits: '123412',
                  last_four_digits: '1234',
                  brand: 'Mastercard',
                  holder_name: 'John Doe',
                  exp_month: 5,
                  exp_year: 2025,
                  status: 'active',
                  type: 'credit',
                  created_at: '2023-09-23T13:22:13Z',
                  updated_at: '2023-09-23T13:22:13Z',
                },
              ],
              paging: { total: 1 },
            },
          },
        )

        const card = new Card()
        const cards = await card.list(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(cards[0]).toEqual(
          expect.objectContaining({
            id: 'card_3dlyaY6SPSb',
            first_six_digits: '123412',
            last_four_digits: '1234',
            brand: 'Mastercard',
            holder_name: 'John Doe',
            exp_month: 5,
            exp_year: 2025,
            type: 'credit',
          }),
        )
      })
    })

    describe('when error', () => {
      it('logs the error message', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '12345',
            licensee,
          }),
        )

        fetchMock.getOnce(
          (url, { headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/12345/cards' && headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 401,
            body: {
              message: 'Authorization has been denied for this request.',
            },
          },
        )

        const card = new Card()
        await card.list(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Não foi possível buscar os cartões na pagar.me.
           status: 401
           mensagem: {"message":"Authorization has been denied for this request."}
           log_id: 1234`,
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '12345',
            licensee,
          }),
        )

        const bodyResponse = {
          message: 'Authorization has been denied for this request.',
        }

        fetchMock.getOnce(
          (url, { headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/12345/cards' && headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 401,
            body: bodyResponse,
          },
        )

        const card = new Card()
        await card.list(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const integrationlog = await Integrationlog.findOne({ contact: contact._id })
        expect(integrationlog.licensee._id).toEqual(contact.licensee._id)
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })

  describe('#getById', () => {
    describe('when success', () => {
      it('returns the customer credit card data', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '12345',
            credit_card_id: 'card_3dlyaY6SPSb',
            licensee,
          }),
        )

        fetchMock.getOnce(
          (url, { headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/12345/cards/card_3dlyaY6SPSb' &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 200,
            body: {
              id: 'card_3dlyaY6SPSb',
              first_six_digits: '123412',
              last_four_digits: '1234',
              brand: 'Mastercard',
              holder_name: 'John Doe',
              exp_month: 5,
              exp_year: 2025,
              status: 'active',
              type: 'credit',
              created_at: '2023-09-23T13:22:13Z',
              updated_at: '2023-09-23T13:22:13Z',
            },
          },
        )

        const card = new Card()
        const cardData = await card.getById(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(cardData).toEqual(
          expect.objectContaining({
            id: 'card_3dlyaY6SPSb',
            first_six_digits: '123412',
            last_four_digits: '1234',
            brand: 'Mastercard',
            holder_name: 'John Doe',
            exp_month: 5,
            exp_year: 2025,
            type: 'credit',
          }),
        )
      })
    })

    describe('when error', () => {
      it('logs the error message', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '12345',
            credit_card_id: 'card_3dlyaY6SPSb',
            licensee,
          }),
        )

        fetchMock.getOnce(
          (url, { headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/12345/cards/card_3dlyaY6SPSb' &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 401,
            body: {
              message: 'Authorization has been denied for this request.',
            },
          },
        )

        const card = new Card()
        await card.getById(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Não foi possível buscar os cartões na pagar.me.
           status: 401
           mensagem: {"message":"Authorization has been denied for this request."}
           log_id: 1234`,
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            customer_id: '12345',
            credit_card_id: 'card_3dlyaY6SPSb',
            licensee,
          }),
        )

        const bodyResponse = {
          message: 'Authorization has been denied for this request.',
        }

        fetchMock.getOnce(
          (url, { headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/12345/cards/card_3dlyaY6SPSb' &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 401,
            body: bodyResponse,
          },
        )

        const card = new Card()
        await card.getById(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const integrationlog = await Integrationlog.findOne({ contact: contact._id })
        expect(integrationlog.licensee._id).toEqual(contact.licensee._id)
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })
})
