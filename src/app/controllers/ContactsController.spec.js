const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const User = require('@models/User')
const request = require('supertest')
const mongoServer = require('../../../.jest/utils')
const { expressServer } = require('../../../.jest/server-express')

describe('contact controller', () => {
  let token
  let licensee

  beforeAll(async () => {
    await mongoServer.connect()

    await User.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password: '12345678',
    })

    await request(expressServer)
      .post('/login')
      .send({ email: 'john@doe.com', password: '12345678' })
      .then((response) => {
        token = response.body.token
      })

    licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })
  })

  afterAll(async () => {
    await mongoServer.disconnect()
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

    it('returns status 500 and message if x-access-token in not inform in header', async () => {
      await request(expressServer)
        .post('/resources/contacts/')
        .set('x-access-token', 'dasadasdasd')
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
          .send({
            name: 'John Doe',
            number: '554492482687',
            type: '@c.us',
            talkingWithChatBot: false,
            licensee: licensee._id,
            waId: '12345',
            landbotId: '56477',
          })
          .expect('Content-Type', /json/)
          .expect(201)
          .then((response) => {
            expect(response.body.name).toEqual('John Doe')
            expect(response.body.number).toEqual('554492482687')
            expect(response.body.type).toEqual('@c.us')
            expect(response.body.talkingWithChatBot).toEqual(false)
            expect(response.body.licensee).toEqual(licensee._id.toString())
            expect(response.body.waId).toEqual('12345')
            expect(response.body.landbotId).toEqual('56477')
          })
      })

      it('returns status 422 and message if the contact is not valid', async () => {
        await request(expressServer)
          .post('/resources/contacts/')
          .set('x-access-token', token)
          .send({ name: 'John Doe', number: '', talkingWithChatBot: false, licensee: licensee._id })
          .expect('Content-Type', /json/)
          .expect(422, {
            errors: [{ message: 'Numero: Você deve preencher o campo' }],
          })
      })

      it('returns status 500 and message if the some error ocurred when create the contact', async () => {
        const contactSaveSpy = jest.spyOn(Contact.prototype, 'save').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .post('/resources/contacts/')
          .set('x-access-token', token)
          .send({
            name: 'John Doe',
            number: '554492482687',
            type: '@c.us',
            talkingWithChatBot: false,
            licensee: licensee._id,
            waId: '12345',
            landbotId: '56477',
          })
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
            .expect(422, {
              errors: [
                { message: 'Numero: Você deve preencher o campo' },
                { message: 'Talking with chatbot: Você deve preencher o campo' },
                { message: 'Licensee: Você deve preencher o campo' },
              ],
            })
        })
      })
    })
  })

  describe('update', () => {
    describe('response', () => {
      it('returns status 200 and the contact data if the update is successful', async () => {
        const contact = await Contact.create({
          name: 'John Doe',
          number: '554492482687',
          type: '@c.us',
          talkingWithChatBot: false,
          licensee: licensee._id,
          waId: '12345',
          landbotId: '56477',
        })

        const licenseeNew = await Licensee.create({ name: 'Another', licenseKind: 'demo' })

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
          })
      })

      it('returns status 422 and message if the contact is not valid', async () => {
        const contact = await Contact.create({
          name: 'John Doe',
          number: '554492482687',
          type: '@c.us',
          talkingWithChatBot: false,
          licensee: licensee._id,
          waId: '12345',
          landbotId: '56477',
        })

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
        const contactFindOneSpy = jest.spyOn(Contact, 'findOne').mockImplementation(() => {
          throw new Error('some error')
        })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '554492482687',
          type: '@c.us',
          talkingWithChatBot: false,
          licensee: licensee._id,
          waId: '12345',
          landbotId: '56477',
        })

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
        const contact = await Contact.create({
          name: 'John Doe',
          number: '554492482687',
          type: '@c.us',
          talkingWithChatBot: false,
          licensee: licensee._id,
          waId: '12345',
          landbotId: '56477',
        })

        await request(expressServer)
          .get(`/resources/contacts/${contact._id}`)
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.name).toEqual('John Doe')
            expect(response.body.number).toEqual('554492482687')
            expect(response.body.type).toEqual('@c.us')
            expect(response.body.talkingWithChatBot).toEqual(false)
            expect(response.body.licensee).toEqual(licensee._id.toString())
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
        const contactFindOneSpy = jest.spyOn(Contact, 'findOne').mockImplementation(() => {
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
            `/resources/contacts/?expression=Doe&talkingWithChatbot=false&licensee=${licensee._id.toString()}&type=@c.us&page=1&limit=3`
          )
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(Array.isArray(response.body)).toEqual(true)
            expect(response.body.length).toEqual(3)
            expect(response.body[1].name).toEqual('John Doe')
            expect(response.body[1].number).toEqual('554492482687')
            expect(response.body[1].type).toEqual('@c.us')
            expect(response.body[1].talkingWithChatBot).toEqual(false)
            expect(response.body[1].licensee).toEqual(licensee._id.toString())
            expect(response.body[1].waId).toEqual('12345')
            expect(response.body[1].landbotId).toEqual('56477')
          })
      })

      it('returns status 500 and message if occurs another error', async () => {
        const contactFindSpy = jest.spyOn(Contact, 'find').mockImplementation(() => {
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
