import { processWebhookRequest } from './ProcessWebhookRequest.js'
import Body from '@models/Body'
import { installMemoryRepositories, resetMemoryRepositories } from '@repositories/testing'
import { licensee as licenseeFactory } from '@factories/licensee'
import { body as bodyFactory } from '@factories/body'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'

describe('processWebhookRequest', () => {
  beforeEach(() => {
    installMemoryRepositories()
    jest.clearAllMocks()
  })

  afterEach(() => {
    resetMemoryRepositories()
  })

  it('loads and deletes the webhook body through the repository contract', async () => {
    const bodyRepository = {
      findFirst: jest.fn().mockResolvedValue({
        kind: 'webhook',
        content: {
          message: 'text',
          provider: 'pagarme',
          type: 'order.paid',
        },
      }),
      delete: jest.fn().mockResolvedValue({ acknowledged: true }),
    }

    const actions = await processWebhookRequest({ bodyId: 'body-1' }, { bodyRepository })

    expect(bodyRepository.findFirst).toHaveBeenCalledWith({ _id: 'body-1' })
    expect(bodyRepository.delete).toHaveBeenCalledWith({ _id: 'body-1' })
    expect(actions).toEqual([
      {
        action: 'process-pagarme-order-paid',
        body: {
          message: 'text',
          provider: 'pagarme',
          type: 'order.paid',
        },
      },
    ])
  })

  describe('when content has provider pagarme', () => {
    it('responds with action with body type', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
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
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
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
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
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
