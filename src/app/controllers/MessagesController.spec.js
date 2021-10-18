const Licensee = require('@models/Licensee')
const User = require('@models/User')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const request = require('supertest')
const mongoServer = require('../../../.jest/utils')
const { expressServer } = require('../../../.jest/server-express')

describe('messengers controller', () => {
  let token

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
          email: 'alcateia@ltda.com',
          phone: '11876509234',
          active: true,
          licenseKind: 'p',
          useChatbot: true,
          chatbotDefault: 'landbot',
          whatsappDefault: 'chatapi',
          chatbotUrl: 'https:/chatbot.url',
          chatbotAuthorizationToken: 'chatbotToken',
          whatsappToken: 'whatsToken',
          whatsappUrl: 'https://whatsapp.url',
          chatUrl: 'https://chat.url',
          awsId: 'awsId',
          awsSecret: 'awsSecret',
          bucketName: 'bucketName',
        })
        .expect('Content-Type', /json/)
        .expect(401, {
          auth: false,
          message: 'Token não informado.',
        })
    })

    it('returns status 500 and message if x-access-token in not inform in header', async () => {
      await request(expressServer)
        .post('/resources/licensees/')
        .set('x-access-token', 'dasadasdasd')
        .send({ name: 'Mary Jane', email: 'mary@jane.com', password: '12345678', active: true })
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
        const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })
        const contact = await Contact.create({
          number: '5511990283745',
          talkingWithChatBot: false,
          licensee: licensee._id,
        })
        await Message.create({
          text: 'Message 1',
          number: contact.number,
          contact: contact._id,
          licensee: licensee._id,
          destination: 'to-chat',
          sended: true,
          createdAt: new Date(2021, 6, 3, 0, 0, 0),
        })

        await request(expressServer)
          .get('/resources/messages/')
          .set('x-access-token', token)
          .send({
            page: 1,
            limit: 25,
            initialDate: '2021-7-1',
            endDate: '2021-7-5',
            licensee: licensee._id,
            contact: contact._id,
            kind: 'text',
            destination: 'to-chat',
            sended: true,
          })
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
