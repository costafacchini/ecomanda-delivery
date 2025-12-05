import Licensee from '@models/Licensee'
import Body from '@models/Body'
import Integrationlog from '@models/Integrationlog'
import request from 'supertest'
import mongoServer from '../../../.jest/utils'
import { expressServer } from '../../../.jest/server-express'
import { queueServer } from '@config/queue'
import { licensee as licenseeFactory } from '@factories/licensee'

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
        .post('/api/v1/orders?token=627365264')
        .send({
          field: 'test',
        })
        .expect('Content-Type', /json/)
        .expect(401, { message: 'Token não informado ou inválido.' })
    })

    it('returns status 401 and message if query param token is informed', async () => {
      await request(expressServer)
        .post('/api/v1/orders')
        .send({
          field: 'test',
        })
        .expect('Content-Type', /json/)
        .expect(401, { message: 'Token não informado ou inválido.' })
    })
  })

  describe('create', () => {
    describe('response', () => {
      it('returns status 202 and schedule job to process order', async () => {
        await request(expressServer)
          .post(`/api/v1/orders?token=${apiToken}`)
          .send({
            MerchantExternalCode: 'merchant-external-code',
            order: {
              id: 'order-id',
            },
          })
          .expect(202)
          .then(async (response) => {
            const body = await Body.findOne({ kind: 'pedidos10' })

            expect(body.content).toEqual({
              MerchantExternalCode: 'merchant-external-code',
              order: {
                id: 'order-id',
              },
            })
            expect(body.kind).toEqual('pedidos10')

            expect(response.body).toEqual({
              id: body._id.toString(),
            })

            const integrationlog = await Integrationlog.findOne({ licensee: body.licensee })
            expect(integrationlog.log_payload).toEqual(body.content)

            expect(queueServerAddJobSpy).toHaveBeenCalledTimes(1)
            expect(queueServerAddJobSpy).toHaveBeenCalledWith('pedidos10-webhook', {
              bodyId: body._id,
              licenseeId: body.licensee,
            })
          })
      })
    })
  })

  describe('changeStatus', () => {
    describe('response', () => {
      it('returns status 200 and schedule job to process order status', async () => {
        await request(expressServer)
          .post(`/api/v1/orders/change-status?token=${apiToken}`)
          .send({
            order: 'order-id',
            status: 'delivered',
          })
          .expect(200)
          .then(async (response) => {
            const body = await Body.findById(response.body.id)

            expect(body.content).toEqual({
              order: 'order-id',
              status: 'delivered',
            })
            expect(body.kind).toEqual('pedidos10')

            expect(response.body).toEqual({
              id: body._id.toString(),
            })

            const integrationlog = await Integrationlog.findOne({ log_payload: body.content })
            expect(integrationlog.log_payload).toEqual(body.content)

            expect(queueServerAddJobSpy).toHaveBeenCalledTimes(1)
            expect(queueServerAddJobSpy).toHaveBeenCalledWith('pedidos10-change-order-status', {
              bodyId: body._id,
              licenseeId: body.licensee,
            })
          })
      })
    })
  })
})
