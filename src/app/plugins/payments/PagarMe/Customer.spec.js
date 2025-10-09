import Customer from './Customer.js'
import Integrationlog from '@models/Integrationlog.js'
import fetchMock from 'fetch-mock'
import mongoServer from '../../../../../.jest/utils.js'
import { licenseeIntegrationPagarMe as licenseeFactory   } from '@factories/licensee.js'
import { contact as contactFactory   } from '@factories/contact.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'
import { ContactRepositoryDatabase  } from '@repositories/contact.js'

describe('PagarMe/Customer plugin', () => {
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
      it('creates a customer on PagarMe API', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            email: 'john@doe.com',
            number: '5511990283745',
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            licensee,
          }),
        )

        const expectedBody = {
          name: 'John Doe',
          email: 'john@doe.com',
          phones: {
            mobile_phone: {
              country_code: '55',
              area_code: '11',
              number: '990283745',
            },
          },
          address: {
            country: 'BR',
            state: 'SP',
            city: 'Sorocaba',
            zip_code: '99876222',
            line_1: `10, Rua qualquer da cidade, Bairro`,
            line_2: 'Perto daquela parada lá',
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 200,
            body: {
              id: 23717165,
              name: 'John Doe',
              status: '',
              address: {
                id: 34224,
              },
            },
          },
        )

        const customer = new Customer()
        await customer.create(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleInfoSpy).toHaveBeenCalledWith('Contato John Doe criado na pagar.me! id: 23717165 log_id: 1234')

        integrationlogCreateSpy.mockRestore()
      })

      it('saves the custromer id on contact', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            email: 'john@doe.com',
            number: '5511990283745',
            licensee,
          }),
        )

        const expectedBody = {
          name: 'John Doe',
          email: 'john@doe.com',
          phones: {
            mobile_phone: {
              country_code: '55',
              area_code: '11',
              number: '990283745',
            },
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 200,
            body: {
              id: 23717165,
              name: 'John Doe',
              status: '',
              address: {
                id: 34224,
              },
            },
          },
        )

        const customer = new Customer()
        await customer.create(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const contactUpdated = await contactRepository.findFirst({ _id: contact._id })
        expect(contactUpdated.customer_id).toEqual('23717165')

        integrationlogCreateSpy.mockRestore()
      })

      it('saves the address id on contact', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            email: 'john@doe.com',
            number: '5511990283745',
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            licensee,
          }),
        )

        const expectedBody = {
          name: 'John Doe',
          email: 'john@doe.com',
          phones: {
            mobile_phone: {
              country_code: '55',
              area_code: '11',
              number: '990283745',
            },
          },
          address: {
            country: 'BR',
            state: 'SP',
            city: 'Sorocaba',
            zip_code: '99876222',
            line_1: `10, Rua qualquer da cidade, Bairro`,
            line_2: 'Perto daquela parada lá',
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 200,
            body: {
              id: 23717165,
              name: 'John Doe',
              status: '',
              address: {
                id: 34224,
              },
            },
          },
        )

        const customer = new Customer()
        await customer.create(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const contactUpdated = await contactRepository.findFirst({ _id: contact._id })
        expect(contactUpdated.address_id).toEqual('34224')

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            email: 'john@doe.com',
            number: '5511990283745',
            licensee,
          }),
        )

        const expectedBody = {
          name: 'John Doe',
          email: 'john@doe.com',
          phones: {
            mobile_phone: {
              country_code: '55',
              area_code: '11',
              number: '990283745',
            },
          },
        }

        const bodyResponse = {
          id: 23717165,
          name: 'John Doe',
          status: '',
          address: {
            id: 34224,
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 200,
            body: bodyResponse,
          },
        )

        const customer = new Customer()
        await customer.create(contact, 'token')
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
            name: 'John Doe',
            email: 'john@doe.com',
            number: '5511990283745',
            licensee,
          }),
        )

        const expectedBody = {
          name: 'John Doe',
          email: 'john@doe.com',
          phones: {
            mobile_phone: {
              country_code: '55',
              area_code: '11',
              number: '990283745',
            },
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
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

        const customer = new Customer()
        await customer.create(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Contato John Doe não criado na pagar.me.
           status: 422
           mensagem: {"message":"The request is invalid.","errors":{"customer.automaticanticipationsettings.type":["The type field is invalid. Possible values are 'full','1025'"]}}
           log_id: 1234`,
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            email: 'john@doe.com',
            number: '5511990283745',
            licensee,
          }),
        )

        const expectedBody = {
          name: 'John Doe',
          email: 'john@doe.com',
          phones: {
            mobile_phone: {
              country_code: '55',
              area_code: '11',
              number: '990283745',
            },
          },
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
              url === 'https://api.pagar.me/core/v5/customers/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 422,
            body: bodyResponse,
          },
        )

        const customer = new Customer()
        await customer.create(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const integrationlog = await Integrationlog.findOne({ contact: contact._id })
        expect(integrationlog.licensee._id).toEqual(contact.licensee._id)
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })

  describe('#update', () => {
    describe('when success', () => {
      it('updates a customer on PagarMe API', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            email: 'john@doe.com',
            number: '5511990283745',
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            licensee,
          }),
        )

        const expectedBody = {
          name: 'John Doe',
          email: 'john@doe.com',
        }

        fetchMock.putOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/98765' &&
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

        const customer = new Customer()
        contact.customer_id = '98765'
        await customer.update(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleInfoSpy).toHaveBeenCalledWith('Contato John Doe atualizado na pagar.me! id: 98765 log_id: 1234')

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            email: 'john@doe.com',
            number: '5511990283745',
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            licensee,
          }),
        )

        const expectedBody = {
          name: 'John Doe',
          email: 'john@doe.com',
        }

        const bodyResponse = {
          id: 23717165,
        }

        fetchMock.putOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/98765' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 200,
            body: bodyResponse,
          },
        )

        const customer = new Customer()
        contact.customer_id = '98765'
        await customer.update(contact, 'token')
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
            name: 'John Doe',
            email: 'john@doe.com',
            number: '5511990283745',
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            licensee,
          }),
        )

        const expectedBody = {
          name: 'John Doe',
          email: 'john@doe.com',
        }

        fetchMock.putOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://api.pagar.me/core/v5/customers/98765' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 400,
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

        const customer = new Customer()
        contact.customer_id = '98765'
        await customer.update(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Contato John Doe não atualizado na pagar.me.
           status: 400
           mensagem: {"message":"The request is invalid.","errors":{"customer.automaticanticipationsettings.type":["The type field is invalid. Possible values are 'full','1025'"]}}
           log_id: 1234`,
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            email: 'john@doe.com',
            number: '5511990283745',
            uf: 'SP',
            city: 'Sorocaba',
            cep: '99876222',
            address_number: '10',
            address: 'Rua qualquer da cidade',
            neighborhood: 'Bairro',
            address_complement: 'Perto daquela parada lá',
            licensee,
          }),
        )

        const expectedBody = {
          name: 'John Doe',
          email: 'john@doe.com',
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
              url === 'https://api.pagar.me/core/v5/customers/98765' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Basic token'
            )
          },
          {
            status: 400,
            body: bodyResponse,
          },
        )

        const customer = new Customer()
        contact.customer_id = '98765'
        await customer.update(contact, 'token')
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
