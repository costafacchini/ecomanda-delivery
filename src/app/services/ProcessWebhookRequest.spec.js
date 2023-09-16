const processWebhookRequest = require('./ProcessWebhookRequest')
const Licensee = require('@models/Licensee')
const Body = require('@models/Body')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { body: bodyFactory } = require('@factories/body')

describe('processWebhookRequest', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('when content has provider pagarme', () => {
    it('responds with action with body type', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())
      const body = await Body.create(
        bodyFactory.build({
          kind: 'webhook',
          content: {
            message: 'text',
            provider: 'pagarme',
            type: 'order.paid',
          },
          licensee,
        }),
      )

      const data = {
        bodyId: body._id,
      }

      const actions = await processWebhookRequest(data)

      expect(actions.length).toEqual(1)
      expect(actions[0].action).toEqual('process-pagarme-order-paid')
      expect(actions[0].body).toEqual({
        message: 'text',
        provider: 'pagarme',
        type: 'order.paid',
      })

      const bodyDeleted = await Body.findById(body._id)
      expect(bodyDeleted).toEqual(null)
    })
  })

  describe('when content has no provider', () => {
    it('responds with action blank', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())
      const body = await Body.create(
        bodyFactory.build({
          kind: 'webhook',
          content: {
            message: 'text',
            type: 'order.paid',
          },
          licensee,
        }),
      )

      const data = {
        bodyId: body._id,
      }

      const actions = await processWebhookRequest(data)

      expect(actions.length).toEqual(0)

      const bodyDeleted = await Body.findById(body._id)
      expect(bodyDeleted).toEqual(null)
    })
  })

  describe('when content has provider other', () => {
    it('responds with action blank', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())
      const body = await Body.create(
        bodyFactory.build({
          kind: 'webhook',
          content: {
            provider: 'any',
            message: 'text',
            type: 'order.paid',
          },
          licensee,
        }),
      )

      const data = {
        bodyId: body._id,
      }

      const actions = await processWebhookRequest(data)

      expect(actions.length).toEqual(0)

      const bodyDeleted = await Body.findById(body._id)
      expect(bodyDeleted).toEqual(null)
    })
  })
})
