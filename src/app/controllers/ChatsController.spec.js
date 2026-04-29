import request from 'supertest'
import { installMemoryRepositories, resetMemoryRepositories } from '@repositories/testing'
import { expressServer } from '../../../.jest/server-express'
import { licensee as licenseeFactory } from '@factories/licensee'
import { publishMessage } from '@config/rabbitmq'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ChatsController } from './ChatsController.js'

jest.mock('@config/rabbitmq', () => ({
  publishMessage: jest.fn(),
}))

function buildResponse() {
  return {
    json: jest.fn(),
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildController() {
  const ingestChatMessage = {
    execute: jest.fn(),
  }
  const publishMessageMock = jest.fn()

  const controller = new ChatsController({ ingestChatMessage, publishMessage: publishMessageMock })

  return { controller, ingestChatMessage, publishMessage: publishMessageMock }
}

describe('ChatsController delegation', () => {
  it('delegates message to ingestChatMessage use case and returns status 200', async () => {
    const { controller, ingestChatMessage } = buildController()
    const req = {
      body: { field: 'test' },
      licensee: { _id: 'licensee-id' },
    }
    const res = buildResponse()

    ingestChatMessage.execute.mockResolvedValue({})

    await controller.message(req, res)

    expect(ingestChatMessage.execute).toHaveBeenCalledWith({ body: req.body, licenseeId: 'licensee-id' })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({ body: 'Solicitação de mensagem para a plataforma de chat agendado' })
  })

  it('publishes reset-chats message and returns status 200 on reset', () => {
    const { controller, publishMessage: publishMessageMock } = buildController()
    const req = {}
    const res = buildResponse()

    controller.reset(req, res)

    expect(publishMessageMock).toHaveBeenCalledWith({ key: 'reset-chats', body: {} })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({
      body: 'Solicitação para avisar os chats com janela vencendo agendado com sucesso',
    })
  })
})

describe('chats controller', () => {
  let apiToken
  jest.spyOn(global.console, 'info').mockImplementation()

  beforeAll(async () => {
    jest.clearAllMocks()
    installMemoryRepositories()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(licenseeFactory.build())
    apiToken = licensee.apiToken
  })

  afterAll(() => {
    resetMemoryRepositories()
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
      it('returns status 200 and schedules job to process chat message', async () => {
        await request(expressServer)
          .post(`/api/v1/chat/message/?token=${apiToken}`)
          .send({
            field: 'test',
            crmData: '',
          })
          .expect('Content-Type', /json/)
          .expect(200, { body: 'Solicitação de mensagem para a plataforma de chat agendado' })
      })
    })
  })

  describe('reset', () => {
    describe('response', () => {
      it('returns status 200 and schedules job to reset whatsapp window', async () => {
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
