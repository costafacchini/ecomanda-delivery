const Licensee = require('@models/Licensee')
const Body = require('@models/Body')
const request = require('supertest')
const mongoServer = require('../../../.jest/utils')
const { expressServer } = require('../../../.jest/server-express')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { publishMessage } = require('@config/rabbitmq')

jest.mock('@config/rabbitmq')

describe('chatbots controller', () => {
  let apiToken
  jest.spyOn(global.console, 'info').mockImplementation()

  beforeAll(async () => {
    jest.clearAllMocks()
    await mongoServer.connect()

    const licensee = await Licensee.create(licenseeFactory.build())
    apiToken = licensee.apiToken
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  describe('message', () => {
    describe('about auth', () => {
      it('returns status 401 and message if query param token is not valid', async () => {
        await request(expressServer)
          .post('/api/v1/chatbot/message/?token=627365264')
          .send({
            field: 'test',
          })
          .expect('Content-Type', /json/)
          .expect(401, { message: 'Token não informado ou inválido.' })
      })

      it('returns status 401 and message if query param token is informed', async () => {
        await request(expressServer)
          .post('/api/v1/chatbot/message')
          .send({
            field: 'test',
          })
          .expect('Content-Type', /json/)
          .expect(401, { message: 'Token não informado ou inválido.' })
      })
    })

    describe('response', () => {
      it('returns status 200 and schedule job to process chatbot message', async () => {
        await request(expressServer)
          .post(`/api/v1/chatbot/message/?token=${apiToken}`)
          .send({
            field: 'test',
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .then(async (response) => {
            const body = await Body.findOne({ content: { field: 'test' } })

            expect(response.body).toEqual({ body: 'Solicitação de mensagem para a plataforma de chatbot agendado' })
            expect(publishMessage).toHaveBeenCalledWith({ key: 'chatbot-message', body: { bodyId: body._id } })
          })
      })
    })
  })

  describe('transfer', () => {
    describe('about auth', () => {
      it('returns status 401 and message if query param token is not valid', async () => {
        await request(expressServer)
          .post('/api/v1/chatbot/transfer/?token=627365264')
          .send({
            field: 'test',
          })
          .expect('Content-Type', /json/)
          .expect(401, { message: 'Token não informado ou inválido.' })
      })

      it('returns status 401 and message if query param token is informed', async () => {
        await request(expressServer)
          .post('/api/v1/chatbot/transfer')
          .send({
            field: 'test',
          })
          .expect('Content-Type', /json/)
          .expect(401, { message: 'Token não informado ou inválido.' })
      })
    })

    describe('response', () => {
      it('returns status 200 and schedule job to transfer chatbot to chat', async () => {
        await request(expressServer)
          .post(`/api/v1/chatbot/transfer/?token=${apiToken}`)
          .send({
            field: 'alter',
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .then(async (response) => {
            const body = await Body.findOne({ content: { field: 'alter' } })

            expect(response.body).toEqual({
              body: 'Solicitação de transferência do chatbot para a plataforma de chat agendado',
            })
            expect(publishMessage).toHaveBeenCalledWith({ key: 'chatbot-transfer-to-chat', body: { bodyId: body._id } })
          })
      })
    })
  })

  describe('reset', () => {
    describe('about auth', () => {
      it('returns status 401 and message if query param token is not valid', async () => {
        await request(expressServer)
          .post('/api/v1/chatbot/reset/?token=627365264')
          .expect('Content-Type', /json/)
          .expect(401, { message: 'Token não informado ou inválido.' })
      })

      it('returns status 401 and message if query param token is informed', async () => {
        await request(expressServer)
          .post('/api/v1/chatbot/reset')
          .expect('Content-Type', /json/)
          .expect(401, { message: 'Token não informado ou inválido.' })
      })
    })

    describe('response', () => {
      it('returns status 200 and schedule job to reset chatbots', async () => {
        await request(expressServer)
          .post(`/api/v1/chatbot/reset/?token=${apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body).toEqual({
              body: 'Solicitação para resetar os chatbots abandonados agendado',
            })
            expect(publishMessage).toHaveBeenCalledWith({ key: 'reset-chatbots', body: {} })
          })
      })
    })
  })
})
