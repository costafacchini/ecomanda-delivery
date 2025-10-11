import Body from '@models/Body'
import request from 'supertest'
import mongoServer from '../../../.jest/utils'
import { expressServer } from '../../../.jest/server-express'
import queueServer from '@config/queue'
import { licensee as licenseeFactory } from '@factories/licensee'
import { publishMessage } from '@config/rabbitmq'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'

jest.mock('@config/rabbitmq', () => ({
  publishMessage: jest.fn(),
}))

describe('chatbots controller', () => {
  let apiToken
  const queueServerAddJobSpy = jest.spyOn(queueServer, 'addJob').mockImplementation(() => Promise.resolve())
  jest.spyOn(global.console, 'info').mockImplementation()

  beforeAll(async () => {
    jest.clearAllMocks()
    await mongoServer.connect()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(licenseeFactory.build())
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

            expect(body.content).toEqual({ field: 'test' })
            expect(body.kind).toEqual('normal')
            expect(response.body).toEqual({ body: 'Solicitação de mensagem para a plataforma de chatbot agendado' })
            expect(queueServerAddJobSpy).toHaveBeenCalledTimes(1)
            expect(queueServerAddJobSpy).toHaveBeenCalledWith('chatbot-message', { bodyId: body._id })
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

            expect(body.content).toEqual({ field: 'alter' })
            expect(body.kind).toEqual('normal')
            expect(response.body).toEqual({
              body: 'Solicitação de transferência do chatbot para a plataforma de chat agendado',
            })
            expect(queueServerAddJobSpy).toHaveBeenCalledTimes(1)
            expect(queueServerAddJobSpy).toHaveBeenCalledWith('chatbot-transfer-to-chat', { bodyId: body._id })
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
