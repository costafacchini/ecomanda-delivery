const Licensee = require('@models/Licensee')
const Body = require('@models/Body')
const request = require('supertest')
const mongoServer = require('../../../.jest/utils')
const { expressServer } = require('../../../.jest/server-express')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { publishMessage } = require('@config/rabbitmq')

jest.mock('@config/rabbitmq')

describe('integrations controller', () => {
  let apiToken

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
        .post('/api/v1/integrations/?token=627365264')
        .send({
          field: 'test',
        })
        .expect('Content-Type', /json/)
        .expect(401, { message: 'Token não informado ou inválido.' })
    })

    it('returns status 401 and message if query param token is informed', async () => {
      await request(expressServer)
        .post('/api/v1/integrations')
        .send({
          field: 'test',
        })
        .expect('Content-Type', /json/)
        .expect(401, { message: 'Token não informado ou inválido.' })
    })
  })

  describe('create', () => {
    describe('response', () => {
      it('returns status 200 and schedule job to process payload', async () => {
        await request(expressServer)
          .post(`/api/v1/integrations/?token=${apiToken}&provider=pagarme`)
          .send({
            kind: 'get-pix',
            payload: {
              cart_id: 'cart-id',
            },
          })
          .expect(200)
          .then(async () => {
            const body = await Body.findOne({ kind: 'webhook' })

            expect(body.content).toEqual({
              provider: 'pagarme',
              kind: 'get-pix',
              payload: {
                cart_id: 'cart-id',
              },
            })
            expect(body.kind).toEqual('webhook')

            expect(publishMessage).toHaveBeenCalledWith({ key: 'process-webhook-request', body: { bodyId: body._id } })
          })
      })
    })
  })
})
