const Licensee = require('@models/Licensee')
const request = require('supertest')
const mongoServer = require('.jest/utils')
const { expressServer } = require('.jest/server-express')
const queueServer = require('@config/queue')

describe('chats controller', () => {
  let apiToken
  const queueServerAddJobSpy = jest.spyOn(queueServer, 'addJob').mockImplementation(() => Promise.resolve())

  beforeAll(async () => {
    jest.clearAllMocks()
    await mongoServer.connect()

    const licensee = await Licensee.create({
      name: 'Alcateia Ltds',
      active: true,
      licenseKind: 'demo',
    })
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

  describe('create', () => {
    describe('response', () => {
      it('returns status 201 and schedule job to process chat message', async () => {
        const licensee = await Licensee.findOne({ apiToken })

        await request(expressServer)
          .post(`/api/v1/chat/message/?token=${apiToken}`)
          .send({
            field: 'test',
          })
          .expect('Content-Type', /json/)
          .expect(201)
          .then((response) => {
            expect(response.body).toEqual({
              body: 'Solicitação de mensagem para a plataforma de chat agendado',
            })
            expect(queueServerAddJobSpy).toHaveBeenCalledTimes(1)
            expect(queueServerAddJobSpy).toHaveBeenCalledWith('chat-message', { field: 'test' }, licensee)
          })
      })
    })
  })
})
