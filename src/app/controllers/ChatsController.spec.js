import Body from '@models/Body'
import request from 'supertest'
import mongoServer from '../../../.jest/utils'
import { expressServer } from '../../../.jest/server-express'
import { queueServer } from '@config/queue'
import { licensee as licenseeFactory } from '@factories/licensee'
import { publishMessage } from '@config/rabbitmq'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'

jest.mock('@config/rabbitmq', () => ({
  publishMessage: jest.fn(),
}))

describe('chats controller', () => {
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

            expect(body.content).toEqual({ field: 'test' })
            expect(body.kind).toEqual('normal')
            expect(response.body).toEqual({
              body: 'Solicitação de mensagem para a plataforma de chat agendado',
            })
            expect(body.content).not.toEqual(expect.objectContaining({ crmData: '' }))
            expect(queueServerAddJobSpy).toHaveBeenCalledTimes(1)
            expect(queueServerAddJobSpy).toHaveBeenCalledWith('chat-message', {
              bodyId: body._id,
              licenseeId: body.licensee,
            })
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
