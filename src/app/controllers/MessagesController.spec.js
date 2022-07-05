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

describe('messengers controller', () => {
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

  describe('index', () => {
    describe('response', () => {
      it('returns status 200 and return messages', async () => {
        const licensee = await Licensee.create(licenseeFactory.build())
        const another_licensee = await Licensee.create(licenseeFactory.build())

        const contact = await Contact.create(contactFactory.build({ licensee }))
        const another_contact = await Contact.create(contactFactory.build({ licensee }))

        await Message.create(messageFactory.build({ licensee, contact }))
        await Message.create(messageFactory.build({ licensee, contact, createdAt: new Date(2021, 5, 30, 0, 0, 0) }))
        await Message.create(messageFactory.build({ licensee, contact, createdAt: new Date(2021, 6, 5, 0, 0, 0) }))
        await Message.create(messageFactory.build({ destination: 'to-chatbot', licensee, contact }))
        await Message.create(messageFactory.build({ licensee: another_licensee, contact }))
        await Message.create(messageFactory.build({ licensee, contact: another_contact }))
        await Message.create(messageFactory.build({ licensee, contact, kind: 'interactive' }))
        await Message.create(messageFactory.build({ licensee, contact, sended: false }))

        await request(expressServer)
          .get(
            `/resources/messages/?page=1&limit=10&destination=to-chat&startDate=2021-07-01T00:00:00.000Z&endDate=2021-07-05T00:00:00.000Z&licensee=${licensee._id}&contact=${contact._id}&kind=text&sended=true`
          )
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(Array.isArray(response.body)).toEqual(true)
            expect(response.body.length).toEqual(1)
            expect(response.body[0].text).toEqual('Message 1')
            expect(response.body[0].number).toEqual('5511990283745')
            expect(response.body[0].destination).toEqual('to-chat')
            expect(response.body[0].sended).toEqual(true)
          })
      })
    })
  })
})
