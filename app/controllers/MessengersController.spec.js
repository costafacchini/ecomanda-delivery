const Licensee = require('@models/Licensee')
const request = require('supertest')
const mongoServer = require('.jest/utils')
const { expressServer } = require('.jest/server-express')
const queueServer = require('@config/queue')

describe('messengers controller', () => {
  let apiToken

  beforeAll(async () => {
    await mongoServer.connect()
    const licensee = await Licensee.create({
      name: 'Alcateia Ltds',
      active: true,
      licenseKind: 'demo'
    })

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
        field: 'test'
      })
      .expect('Content-Type', /json/)
      .expect(401, { message: 'Token não informado ou inválido.' })
    })

    it('returns status 401 and message if query param token is informed', async () => {
      await request(expressServer)
      .post('/api/v1/messenger/message')
      .send({
        field: 'test'
      })
      .expect('Content-Type', /json/)
      .expect(401, { message: 'Token não informado ou inválido.' })
    })
  })

  describe('create', () => {
    describe('response', () => {
      it('returns status 201 and schedule job to process chat message', async () => {
        const mockFunction = jest.spyOn(queueServer, 'addJob').mockImplementation(() => Promise.resolve())
        const licensee = await Licensee.findOne({ apiToken })

        await request(expressServer)
        .post(`/api/v1/messenger/message/?token=${apiToken}`)
        .send({
          field: 'test',
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .then((response) => {
          expect(response.body).toEqual({ body: 'Solicitação de de mensagem para a plataforma de messenger agendado' })
          expect(mockFunction).toHaveBeenCalledTimes(1)
          expect(mockFunction).toHaveBeenCalledWith('messenger-message', { field: 'test' }, licensee)
        })

        mockFunction.mockRestore()
      })
    })
  })
})
