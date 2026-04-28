import User from '@models/User'
import request from 'supertest'
import { installMemoryRepositories, resetMemoryRepositories } from '@repositories/testing'
import { queueServer } from '@config/queue'
import { expressServer } from '../../../.jest/server-express'
import { userSuper as userSuperFactory } from '@factories/user'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { ContactsQuery } from '@queries/ContactsQuery'
import { ContactsController } from './ContactsController.js'

function buildResponse() {
  return {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

async function runValidations(controller, req) {
  const validations = controller.validations()

  for (const validation of validations) {
    await validation.run(req)
  }
}

function buildController() {
  const contactRepository = {
    findFirst: jest.fn(),
  }
  const createContactsQuery = jest.fn()
  const createContact = {
    execute: jest.fn(),
  }
  const updateContact = {
    execute: jest.fn(),
  }

  const controller = new ContactsController({
    contactRepository,
    createContactsQuery,
    createContact,
    updateContact,
  })

  return {
    controller,
    contactRepository,
    createContactsQuery,
    createContact,
    updateContact,
  }
}

describe('ContactsController delegation', () => {
  it('delegates create to the createContact use case and returns status 201', async () => {
    const { controller, createContact } = buildController()
    const req = {
      body: {
        name: 'John Doe',
        number: '5511990283745',
        type: '@c.us',
        talkingWithChatBot: false,
        licensee: 'licensee-id',
      },
    }
    const res = buildResponse()
    const contact = { _id: 'contact-id', name: 'John Doe' }

    createContact.execute.mockResolvedValue(contact)

    await controller.create(req, res)

    expect(createContact.execute).toHaveBeenCalledWith(req.body)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalledWith(contact)
  })

  it('returns status 422 when create validation fails before delegating to the use case', async () => {
    const { controller, createContact } = buildController()
    const req = {
      body: {
        email: 'john-doe.com',
      },
    }
    const res = buildResponse()

    await runValidations(controller, req)
    await controller.create(req, res)

    expect(createContact.execute).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.send).toHaveBeenCalledWith({
      errors: [{ message: 'Email deve ser preenchido com um valor válido' }],
    })
  })

  it('returns status 422 when createContact raises model validation errors', async () => {
    const { controller, createContact } = buildController()
    const req = {
      body: {
        type: '@c.us',
      },
    }
    const res = buildResponse()

    createContact.execute.mockRejectedValue({
      errors: {
        number: { message: 'Numero: Você deve preencher o campo' },
        talkingWithChatBot: { message: 'Talking with chatbot: Você deve preencher o campo' },
        licensee: { message: 'Licensee: Você deve preencher o campo' },
      },
    })

    await controller.create(req, res)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.send).toHaveBeenCalledWith({
      errors: [
        { message: 'Numero: Você deve preencher o campo' },
        { message: 'Talking with chatbot: Você deve preencher o campo' },
        { message: 'Licensee: Você deve preencher o campo' },
      ],
    })
  })

  it('returns status 500 when createContact throws an unexpected error', async () => {
    const { controller, createContact } = buildController()
    const req = {
      body: {
        name: 'John Doe',
        number: '5511990283745',
      },
    }
    const res = buildResponse()

    createContact.execute.mockRejectedValue(new Error('some error'))

    await controller.create(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
      errors: { message: 'Error: some error' },
    })
  })

  it('delegates update to the updateContact use case and returns status 200', async () => {
    const { controller, updateContact } = buildController()
    const req = {
      params: { id: 'contact-id' },
      body: {
        name: 'John Silva',
        number: '55998465654',
        type: '@g.us',
        talkingWithChatBot: true,
        licensee: 'licensee-id',
      },
    }
    const res = buildResponse()
    const contact = { _id: 'contact-id', name: 'John Silva' }

    updateContact.execute.mockResolvedValue(contact)

    await controller.update(req, res)

    expect(updateContact.execute).toHaveBeenCalledWith('contact-id', req.body)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(contact)
  })

  it('returns status 422 when updateContact raises model validation errors', async () => {
    const { controller, updateContact } = buildController()
    const req = {
      params: { id: 'contact-id' },
      body: { number: '' },
    }
    const res = buildResponse()

    updateContact.execute.mockRejectedValue({
      errors: {
        number: { message: 'Numero: Você deve preencher o campo' },
      },
    })

    await controller.update(req, res)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.send).toHaveBeenCalledWith({
      errors: [{ message: 'Numero: Você deve preencher o campo' }],
    })
  })

  it('returns status 500 when updateContact throws an unexpected error', async () => {
    const { controller, updateContact } = buildController()
    const req = {
      params: { id: 'contact-id' },
      body: { name: 'Name modified' },
    }
    const res = buildResponse()

    updateContact.execute.mockRejectedValue(new Error('some error'))

    await controller.update(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
      errors: { message: 'Error: some error' },
    })
  })
})

describe('contact controller', () => {
  let token
  let licensee

  const queueServerAddJobSpy = jest.spyOn(queueServer, 'addJob').mockImplementation(() => Promise.resolve())

  beforeAll(async () => {
    installMemoryRepositories()

    await User.create(userSuperFactory.build())

    await request(expressServer)
      .post('/login')
      .send({ email: 'john@doe.com', password: '12345678' })
      .then((response) => {
        token = response.body.token
      })

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())
  })

  afterAll(() => {
    resetMemoryRepositories()
  })

  describe('about auth', () => {
    it('returns status 401 and message if x-access-token in not inform in header', async () => {
      await request(expressServer)
        .post('/resources/contacts/')
        .send({
          name: 'John Doe',
        })
        .expect('Content-Type', /json/)
        .expect(401, {
          auth: false,
          message: 'Token não informado.',
        })
    })

    it('returns status 500 and message if x-access-token in invalid', async () => {
      await request(expressServer)
        .post('/resources/contacts/')
        .set('x-access-token', 'invalid')
        .send({ name: 'Mary Jane' })
        .expect('Content-Type', /json/)
        .expect(500, {
          auth: false,
          message: 'Falha na autenticação com token.',
        })
    })
  })

  describe('create', () => {
    describe('response', () => {
      it('returns status 201 and the contact data if the create is successful', async () => {
        await request(expressServer)
          .post('/resources/contacts/')
          .set('x-access-token', token)
          .send(
            contactFactory.build({
              name: 'John Doe',
              type: '@c.us',
              licensee,
              waId: '12345',
              landbotId: '56477',
            }),
          )
          .expect('Content-Type', /json/)
          .expect(201)
          .then((response) => {
            expect(response.body.name).toEqual('John Doe')
            expect(response.body.number).toEqual('5511990283745')
            expect(response.body.type).toEqual('@c.us')
            expect(response.body.talkingWithChatBot).toEqual(false)
            expect(response.body.licensee).toEqual(licensee._id.toString())
            expect(response.body.waId).toEqual('12345')
            expect(response.body.landbotId).toEqual('56477')
            expect(queueServerAddJobSpy).toHaveBeenCalledTimes(1)
            expect(queueServerAddJobSpy).toHaveBeenCalledWith('send-contact-to-pagarme', {
              contactId: response.body._id,
            })
          })
      })

      it('returns status 422 and message if the contact is not valid', async () => {
        await request(expressServer)
          .post('/resources/contacts/')
          .set('x-access-token', token)
          .send(contactFactory.build({ number: '', licensee }))
          .expect('Content-Type', /json/)
          .expect(422, {
            errors: [{ message: 'Numero: Você deve preencher o campo' }],
          })
      })

      it('returns status 500 and message if the some error ocurred when create the contact', async () => {
        const contactSaveSpy = jest.spyOn(ContactRepositoryDatabase.prototype, 'create').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .post('/resources/contacts/')
          .set('x-access-token', token)
          .send(contactFactory.build({ licensee }))
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        contactSaveSpy.mockRestore()
      })

      describe('validations', () => {
        it('returns status 422 and message if contacts is invalid', async () => {
          await request(expressServer)
            .post('/resources/contacts/')
            .set('x-access-token', token)
            .send({
              type: '@c.us',
            })
            .expect('Content-Type', /json/)
            .expect(422)
            .then((response) => {
              expect(response.body.errors).toEqual(
                expect.arrayContaining([
                  { message: 'Numero: Você deve preencher o campo' },
                  { message: 'Talking with chatbot: Você deve preencher o campo' },
                  { message: 'Licensee: Você deve preencher o campo' },
                ]),
              )
              expect(response.body.errors).toHaveLength(3)
            })
        })
      })
    })
  })

  describe('update', () => {
    describe('response', () => {
      it('returns status 200 and the contact data if the update is successful', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            type: '@c.us',
            licensee,
            waId: '12345',
            landbotId: '56477',
          }),
        )

        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licenseeNew = await licenseeRepository.create(licenseeFactory.build())

        await request(expressServer)
          .post(`/resources/contacts/${contact._id}`)
          .set('x-access-token', token)
          .send({
            _id: 123,
            name: 'John Silva',
            number: '55998465654',
            type: '@g.us',
            talkingWithChatBot: true,
            licensee: licenseeNew._id,
            waId: '54321',
            landbotId: '9876',
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.name).toEqual('John Silva')
            expect(response.body.number).toEqual('55998465654')
            expect(response.body.type).toEqual('@g.us')
            expect(response.body.talkingWithChatBot).toEqual(true)
            expect(response.body.waId).toEqual('54321')
            expect(response.body.landbotId).toEqual('9876')

            expect(response.body._id).not.toEqual(123)
            expect(response.body.licensee).not.toEqual(licenseeNew._id.toString())
            expect(queueServerAddJobSpy).toHaveBeenCalledTimes(1)
            expect(queueServerAddJobSpy).toHaveBeenCalledWith('send-contact-to-pagarme', {
              contactId: response.body._id,
            })
          })
      })

      it('returns status 422 and message if the contact is not valid', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            type: '@c.us',
            licensee,
            waId: '12345',
            landbotId: '56477',
          }),
        )

        await request(expressServer)
          .post(`/resources/contacts/${contact._id}`)
          .set('x-access-token', token)
          .send({ number: '' })
          .expect('Content-Type', /json/)
          .expect(422, {
            errors: [{ message: 'Numero: Você deve preencher o campo' }],
          })
      })

      it('returns status 500 and message if the some error ocurre when update the contact', async () => {
        const contactFindOneSpy = jest
          .spyOn(ContactRepositoryDatabase.prototype, 'findFirst')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(contactFactory.build({ licensee }))

        await request(expressServer)
          .post(`/resources/contacts/${contact._id}`)
          .set('x-access-token', token)
          .send({ name: 'Name modified', email: 'modified@alcateia.com', phone: '110985387875' })
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
            waId: '12345',
            landbotId: '56477',
          }),
        )

        await request(expressServer)
          .get(`/resources/contacts/${contact._id}`)
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.name).toEqual('John Doe')
            expect(response.body.number).toEqual('5511990283745')
            expect(response.body.type).toEqual('@c.us')
            expect(response.body.talkingWithChatBot).toEqual(false)
            expect(response.body.licensee._id.toString()).toEqual(licensee._id.toString())
            expect(response.body.waId).toEqual('12345')
            expect(response.body.landbotId).toEqual('56477')
            expect(response.body._id).toEqual(contact._id.toString())
          })
      })

      it('returns status 404 and message if contact does not exists', async () => {
        await request(expressServer)
          .get('/resources/contacts/12312')
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(404, {
            errors: { message: 'Contato 12312 não encontrado' },
          })
      })

      it('returns status 500 and message if occurs another error', async () => {
        const contactFindOneSpy = jest
          .spyOn(ContactRepositoryDatabase.prototype, 'findFirst')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        await request(expressServer)
          .get('/resources/contacts/12312')
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        contactFindOneSpy.mockRestore()
      })
    })
  })

  describe('index', () => {
    describe('response', () => {
      it('returns status 200 and message if contact exists', async () => {
        await request(expressServer)
          .get(
            `/resources/contacts/?expression=Doe&talkingWithChatbot=false&licensee=${licensee._id.toString()}&type=@c.us&page=1&limit=3`,
          )
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(Array.isArray(response.body)).toEqual(true)
            expect(response.body.length).toEqual(3)
            expect(response.body[1].name).toEqual('John Doe')
            expect(response.body[1].number).toEqual('5511990283745')
            expect(response.body[1].type).toEqual('@c.us')
            expect(response.body[1].talkingWithChatBot).toEqual(false)
            expect(response.body[1].licensee).toEqual(licensee._id.toString())
            expect(response.body[1].waId).toEqual('12345')
            expect(response.body[1].landbotId).toEqual('56477')
          })
      })

      it('returns status 500 and message if occurs another error', async () => {
        const contactFindSpy = jest.spyOn(ContactsQuery.prototype, 'all').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .get('/resources/contacts/')
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        contactFindSpy.mockRestore()
      })
    })
  })
})
