const Body = require('@models/Body')
const request = require('supertest')
const mongoServer = require('../../../.jest/utils')
const { expressServer } = require('../../../.jest/server-express')
const queueServer = require('@config/queue')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')

describe('messengers controller', () => {
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

  describe('create', () => {
    describe('response', () => {
      it('returns status 200 and schedule job to process chat message', async () => {
        await request(expressServer)
          .post(`/api/v1/messenger/message/?token=${apiToken}`)
          .send({
            field: 'test',
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .then(async (response) => {
            const body = await Body.findOne({ content: { field: 'test' } })

            expect(body.content).toEqual({ field: 'test' })
            expect(body.kind).toEqual('normal')
            expect(response.body).toEqual({
              body: 'Solicitação de mensagem para a plataforma de messenger agendado',
            })
            expect(queueServerAddJobSpy).toHaveBeenCalledTimes(1)
            expect(queueServerAddJobSpy).toHaveBeenCalledWith('messenger-message', { bodyId: body._id })
          })
      })
    })
  })
})
