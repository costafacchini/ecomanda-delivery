import request from 'supertest'
import mongoServer from '../../../../.jest/utils.js'
import { expressServer  } from '../../../../.jest/server-express.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { contact as contactFactory   } from '@factories/contact.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'
import { ContactRepositoryDatabase  } from '@repositories/contact.js'

describe('addresses controller', () => {
  let licensee

  beforeAll(async () => {
    await mongoServer.connect()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  describe('about auth', () => {
    it('returns status 401 and message if query param token is not valid', async () => {
      await request(expressServer)
        .get('/api/v1/contacts/address/48999083624?token=627365264')
        .expect('Content-Type', /json/)
        .expect(401, { message: 'Token não informado ou inválido.' })
    })

    it('returns status 401 and message if query param token is informed', async () => {
      await request(expressServer)
        .get('/api/v1/contacts/address')
        .expect('Content-Type', /json/)
        .expect(401, { message: 'Token não informado ou inválido.' })
    })
  })

  describe('update', () => {
    describe('response', () => {
      it('returns status 200 and the contact address data if the update is successful', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        await contactRepository.create(
          contactFactory.build({
            number: '5511990283745',
            name: 'John Doe',
            type: '@c.us',
            licensee,
          }),
        )

        await request(expressServer)
          .post(`/api/v1/contacts/address/11990283745?token=${licensee.apiToken}`)
          .send({
            address: 'Rua dois de outubro',
            address_number: '123',
            address_complement: 'rooms 1 and 2',
            neighborhood: 'Pedra branca',
            city: 'São Paulo',
            cep: '98543287',
            uf: 'SP',
            delivery_tax: 10.39,
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.name).toEqual('John Doe')
            expect(response.body.number).toEqual('5511990283745')
            expect(response.body.type).toEqual('@c.us')
            expect(response.body.address).toEqual('Rua dois de outubro')
            expect(response.body.address_number).toEqual('123')
            expect(response.body.address_complement).toEqual('rooms 1 and 2')
            expect(response.body.neighborhood).toEqual('Pedra branca')
            expect(response.body.city).toEqual('São Paulo')
            expect(response.body.uf).toEqual('SP')
            expect(response.body.cep).toEqual('98543287')
            expect(response.body.delivery_tax).toEqual(10.39)
            expect(response.body.licensee).toEqual(licensee._id.toString())
          })
      })

      it('returns status 404 and message if the contact is not founded', async () => {
        await request(expressServer)
          .post(`/api/v1/contacts/address/1111111?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(404, { errors: { message: 'Contato 1111111 não encontrado' } })
      })

      it('returns status 500 and message if the some error ocurred when update the contact', async () => {
        const contactFindOneSpy = jest
          .spyOn(ContactRepositoryDatabase.prototype, 'findFirst')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        const contactRepository = new ContactRepositoryDatabase()
        await contactRepository.create(contactFactory.build({ number: '5511990283745', licensee }))

        await request(expressServer)
          .post(`/api/v1/contacts/address/11990283745?token=${licensee.apiToken}`)
          .send({ address: 'Address modified' })
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        contactFindOneSpy.mockRestore()
      })
    })
  })

  describe('show', () => {
    describe('response', () => {
      it('returns status 200 and message if contact exists', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            type: '@c.us',
            licensee,
            address: 'Rua dois de outubro',
            address_number: '123',
            address_complement: 'rooms 1 and 2',
            neighborhood: 'Pedra branca',
            city: 'São Paulo',
            cep: '98543287',
            uf: 'SP',
            delivery_tax: 10.39,
          }),
        )

        await request(expressServer)
          .get(`/api/v1/contacts/address/${contact.number}?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.name).toEqual('John Doe')
            expect(response.body.number).toEqual('5511990283745')
            expect(response.body.type).toEqual('@c.us')
            expect(response.body.address).toEqual('Rua dois de outubro')
            expect(response.body.address_number).toEqual('123')
            expect(response.body.address_complement).toEqual('rooms 1 and 2')
            expect(response.body.neighborhood).toEqual('Pedra branca')
            expect(response.body.city).toEqual('São Paulo')
            expect(response.body.uf).toEqual('SP')
            expect(response.body.cep).toEqual('98543287')
            expect(response.body.delivery_tax).toEqual(10.39)
            expect(response.body.licensee._id.toString()).toEqual(licensee._id.toString())
          })
      })

      it('returns status 404 and message if contact does not exists', async () => {
        await request(expressServer)
          .get(`/api/v1/contacts/address/111111?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(404, {
            errors: { message: 'Contato 111111 não encontrado' },
          })
      })

      it('returns status 500 and message if occurs another error', async () => {
        const contactFindOneSpy = jest
          .spyOn(ContactRepositoryDatabase.prototype, 'findFirst')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(contactFactory.build({ number: '5511990283745', licensee }))

        await request(expressServer)
          .get(`/api/v1/contacts/address/${contact.number}?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        contactFindOneSpy.mockRestore()
      })
    })
  })
})
