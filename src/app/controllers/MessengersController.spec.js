import request from 'supertest'
import { installMemoryRepositories, resetMemoryRepositories } from '@repositories/testing'
import { expressServer } from '../../../.jest/server-express'
import { licensee as licenseeFactory } from '@factories/licensee'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { MessengersController } from './MessengersController.js'

function buildResponse() {
  return {
    json: jest.fn(),
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildController() {
  const ingestMessengerMessage = {
    execute: jest.fn(),
  }

  const controller = new MessengersController({ ingestMessengerMessage })

  return { controller, ingestMessengerMessage }
}

describe('MessengersController delegation', () => {
  it('delegates message to ingestMessengerMessage use case and returns status 200', async () => {
    const { controller, ingestMessengerMessage } = buildController()
    const req = {
      body: { field: 'test' },
      licensee: { _id: 'licensee-id' },
    }
    const res = buildResponse()

    ingestMessengerMessage.execute.mockResolvedValue({})

    await controller.message(req, res)

    expect(ingestMessengerMessage.execute).toHaveBeenCalledWith({ body: req.body, licenseeId: 'licensee-id' })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({ body: 'Solicitação de mensagem para a plataforma de messenger agendado' })
  })
})

describe('messengers controller', () => {
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
        .post('/api/v1/messenger/message/?token=627365264')
        .send({
          field: 'test',
        })
        .expect('Content-Type', /json/)
        .expect(401, { message: 'Token não informado ou inválido.' })
    })

    it('returns status 401 and message if query param token is informed', async () => {
      await request(expressServer)
        .post('/api/v1/messenger/message')
        .send({
          field: 'test',
        })
        .expect('Content-Type', /json/)
        .expect(401, { message: 'Token não informado ou inválido.' })
    })
  })

  describe('message', () => {
    describe('response', () => {
      it('returns status 200 and schedules job to process messenger message', async () => {
        await request(expressServer)
          .post(`/api/v1/messenger/message/?token=${apiToken}`)
          .send({
            field: 'test',
          })
          .expect('Content-Type', /json/)
          .expect(200, { body: 'Solicitação de mensagem para a plataforma de messenger agendado' })
      })
    })
  })
})
