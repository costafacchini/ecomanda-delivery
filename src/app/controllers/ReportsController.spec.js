const Licensee = require('@models/Licensee')
const User = require('@models/User')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const request = require('supertest')
const mongoServer = require('../../../.jest/utils')
const { expressServer } = require('../../../.jest/server-express')
const { userSuper: userSuperFactory } = require('@factories/user')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { message: messageFactory } = require('@factories/message')

describe('reports controller', () => {
  let token

  beforeAll(async () => {
    await mongoServer.connect()

    await User.create(userSuperFactory.build())

    await request(expressServer)
      .post('/login')
      .send({ email: 'john@doe.com', password: '12345678' })
      .then((response) => {
        token = response.body.token
      })
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  describe('about auth', () => {
    it('returns status 401 and message if x-access-token in not inform in header', async () => {
      await request(expressServer)
        .post('/resources/licensees/')
        .send({
          name: 'Alcateia Ltda',
        })
        .expect('Content-Type', /json/)
        .expect(401, {
          auth: false,
          message: 'Token não informado.',
        })
    })

    it('returns status 500 and message if x-access-token is invalid', async () => {
      await request(expressServer)
        .post('/resources/licensees/')
        .set('x-access-token', 'invalid')
        .send({ name: 'Mary Jane' })
        .expect('Content-Type', /json/)
        .expect(500, {
          auth: false,
          message: 'Falha na autenticação com token.',
        })
    })
  })

  describe('billing', () => {
    describe('response', () => {
      it('returns status 200 and return records', async () => {
        const licensee = await Licensee.create(licenseeFactory.build())
        const contact = await Contact.create(contactFactory.build({ licensee }))

        await Message.create(messageFactory.build({ licensee, contact, createdAt: new Date(2021, 4, 30, 0, 0, 0) }))
        await Message.create(messageFactory.build({ licensee, contact, createdAt: new Date(2021, 5, 5, 0, 0, 0) }))

        await request(expressServer)
          .get('/resources/reports/billing/?reportDate=2021-07-02T00:00:00.000Z')
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(Array.isArray(response.body)).toEqual(true)
            expect(response.body.length).toEqual(1)
            expect(response.body[0].firstMessageDate).toEqual('2021-05-30T03:00:00.000Z')
            expect(response.body[0].lastMessageDate).toEqual('2021-06-05T03:00:00.000Z')
            expect(response.body[0].billing).toEqual(true)
            expect(response.body[0].messages[0].month).toEqual('05')
            expect(response.body[0].messages[0].year).toEqual('2021')
            expect(response.body[0].messages[0].count).toEqual(1)
            expect(response.body[0].messages[1].month).toEqual('06')
            expect(response.body[0].messages[1].year).toEqual('2021')
            expect(response.body[0].messages[1].count).toEqual(1)
          })
      })
    })
  })
})
