const Customer = require('./Customer')
const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const fetchMock = require('fetch-mock')
const mongoServer = require('../../../../../.jest/utils')
const { licenseeIntegrationPagarMe: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')

describe('PagarMe/Customer plugin', () => {
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
      it('creates a customer on PagarMe API', async () => {
        const contact = await Contact.create(
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
          })
        )

        const expectedBody = {
          name: 'John Doe',
          email: 'john@doe.com',
          address: {
            country: 'BR',
            state: 'SP',
            city: 'Sorocaba',
            zip_code: '99876222',
            line_1: `10, Rua qualquer da cidade, Bairro`,
            line_2: 'Perto daquela parada lá',
          },
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
          }
        )

        const customer = new Customer()
        await customer.create(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          'Contato John Doe criado na pagar.me! {"id":23717165,"name":"John Doe","status":"","address":{"id":34224}}'
        )
      })

      it('saves the custromer id on contact', async () => {
        const contact = await Contact.create(
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
          })
        )

        const expectedBody = {
          name: 'John Doe',
          email: 'john@doe.com',
          address: {
            country: 'BR',
            state: 'SP',
            city: 'Sorocaba',
            zip_code: '99876222',
            line_1: `10, Rua qualquer da cidade, Bairro`,
            line_2: 'Perto daquela parada lá',
          },
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
          }
        )

        const customer = new Customer()
        await customer.create(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const contactUpdated = await Contact.findById(contact._id)
        expect(contactUpdated.customer_id).toEqual('23717165')
      })

      it('saves the address id on contact', async () => {
        const contact = await Contact.create(
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
          })
        )

        const expectedBody = {
          name: 'John Doe',
          email: 'john@doe.com',
          address: {
            country: 'BR',
            state: 'SP',
            city: 'Sorocaba',
            zip_code: '99876222',
            line_1: `10, Rua qualquer da cidade, Bairro`,
            line_2: 'Perto daquela parada lá',
          },
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
          }
        )

        const customer = new Customer()
        await customer.create(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const contactUpdated = await Contact.findById(contact._id)
        expect(contactUpdated.address_id).toEqual('34224')
      })
    })

    describe('when error', () => {
      it('logs the error message', async () => {
        const contact = await Contact.create(
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
          })
        )

        const expectedBody = {
          name: 'John Doe',
          email: 'john@doe.com',
          address: {
            country: 'BR',
            state: 'SP',
            city: 'Sorocaba',
            zip_code: '99876222',
            line_1: `10, Rua qualquer da cidade, Bairro`,
            line_2: 'Perto daquela parada lá',
          },
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
          }
        )

        const customer = new Customer()
        await customer.create(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Contato John Doe não criado na pagar.me.
           status: 422
           mensagem: {"message":"The request is invalid.","errors":{"customer.automaticanticipationsettings.type":["The type field is invalid. Possible values are 'full','1025'"]}}`
        )
      })
    })
  })

  describe('#update', () => {
    describe('when success', () => {
      it('updates a customer on PagarMe API', async () => {
        const contact = await Contact.create(
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
          })
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
          }
        )

        const customer = new Customer()
        contact.customer_id = '98765'
        await customer.update(contact, 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleInfoSpy).toHaveBeenCalledWith('Contato John Doe atualizado na pagar.me! {"id":23717165}')
      })
    })

    describe('when error', () => {
      it('logs the error message', async () => {
        const contact = await Contact.create(
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
          })
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
          }
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
           mensagem: {"message":"The request is invalid.","errors":{"customer.automaticanticipationsettings.type":["The type field is invalid. Possible values are 'full','1025'"]}}`
        )
      })
    })
  })
})
