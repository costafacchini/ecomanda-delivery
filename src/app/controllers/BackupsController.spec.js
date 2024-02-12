const request = require('supertest')
const mongoServer = require('../../../.jest/utils')
const { expressServer } = require('../../../.jest/server-express')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { publishMessage } = require('@config/rabbitmq')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')

jest.mock('@config/rabbitmq')

describe('backups controller', () => {
  let apiToken, licensee

  jest.spyOn(global.console, 'info').mockImplementation()

  beforeAll(async () => {
    jest.clearAllMocks()
    await mongoServer.connect()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())
    apiToken = licensee.apiToken
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  describe('about auth', () => {
    it('returns status 401 and message if query param token is not valid', async () => {
      await request(expressServer)
        .post('/api/v1/backups/schedule/?token=627365264')
        .expect('Content-Type', /json/)
        .expect(401, { message: 'Token não informado ou inválido.' })
    })

    it('returns status 401 and message if query param token is informed', async () => {
      await request(expressServer)
        .post('/api/v1/backups/schedule')
        .expect('Content-Type', /json/)
        .expect(401, { message: 'Token não informado ou inválido.' })
    })
  })

  describe('schedule', () => {
    describe('response', () => {
      it('returns status 200 and schedule job to scheduled backup', async () => {
        await request(expressServer)
          .post(`/api/v1/backups/schedule/?token=${apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body).toEqual({
              body: 'Backup agendado',
            })
            expect(publishMessage).toHaveBeenCalledWith({ key: 'backup', body: {} })
          })
      })
    })
  })

  describe('clear', () => {
    describe('response', () => {
      it('returns status 200 and schedule job to scheduled clear old backups', async () => {
        await request(expressServer)
          .post(`/api/v1/backups/clear/?token=${apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body).toEqual({
              body: 'Limpeza de backups antigos agendados',
            })
            expect(publishMessage).toHaveBeenCalledWith({ key: 'clear-backups', body: {} })
          })
      })
    })
  })
})
