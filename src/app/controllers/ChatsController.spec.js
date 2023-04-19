const Licensee = require('@models/Licensee')
const Body = require('@models/Body')
const request = require('supertest')
const mongoServer = require('../../../.jest/utils')
const { expressServer } = require('../../../.jest/server-express')
const queueServer = require('@config/queue')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { publishMessage } = require('@config/rabbitmq')

jest.mock('@config/rabbitmq')

describe('chats controller', () => {
  let apiToken
  const queueServerAddJobSpy = jest.spyOn(queueServer, 'addJob').mockImplementation(() => Promise.resolve())
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

  describe('about auth', () => {
    it('returns status 401 and message if query param token is not valid', async () => {
      await request(expressServer)
        .post('/api/v1/chat/message/?token=627365264')
        .send({
          field: 'test',
        })
        .expect('Content-Type', /json/)
        .expect(401, { message: 'Token não informado ou inválido.' })
    })

    it('returns status 401 and message if query param token is informed', async () => {
      await request(expressServer)
        .post('/api/v1/chat/message')
        .send({
          field: 'test',
        })
        .expect('Content-Type', /json/)
        .expect(401, { message: 'Token não informado ou inválido.' })
    })
  })

  describe('message', () => {
    describe('response', () => {
      it('returns status 200 and schedule job to process chat message', async () => {
        await request(expressServer)
          .post(`/api/v1/chat/message/?token=${apiToken}`)
          .send({
            field: 'test',
            crmData: '',
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .then(async (response) => {
            const body = await Body.findOne({ content: { field: 'test' } })

            expect(response.body).toEqual({
              body: 'Solicitação de mensagem para a plataforma de chat agendado',
            })
            expect(body.content).not.toEqual(expect.objectContaining({ crmData: '' }))
            expect(queueServerAddJobSpy).toHaveBeenCalledTimes(1)
            expect(queueServerAddJobSpy).toHaveBeenCalledWith('chat-message', { bodyId: body._id })
          })
      })
    })
  })

  describe('reset', () => {
    describe('response', () => {
      it('returns status 200 and schedule job to reset whatsapp window', async () => {
        await request(expressServer)
          .post(`/api/v1/chat/reset/?token=${apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body).toEqual({
              body: 'Solicitação para avisar os chats com janela vencendo agendado com sucesso',
            })
            expect(publishMessage).toHaveBeenCalledWith({ key: 'reset-chats', body: {} })
          })
      })
    })
  })
})
