import { licenseeComplete as licenseeCompleteFactory } from '@factories/licensee'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import {
  SignPedidos10OrderWebhook,
  WEBHOOK_NOT_SIGNED_MESSAGE,
  WEBHOOK_SIGNED_MESSAGE,
} from './SignPedidos10OrderWebhook.js'

describe('SignPedidos10OrderWebhook', () => {
  it('signs the webhook when pedidos10 integration data is present', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const pedidos10 = {
      signOrderWebhook: jest.fn(),
    }
    const createPedidos10 = jest.fn().mockReturnValue(pedidos10)
    const signPedidos10OrderWebhook = new SignPedidos10OrderWebhook({ licenseeRepository, createPedidos10 })
    const licensee = await licenseeRepository.create(
      licenseeCompleteFactory.build({ pedidos10_integration: { username: 'user' } }),
    )

    const response = await signPedidos10OrderWebhook.execute(licensee._id)

    expect(createPedidos10).toHaveBeenCalledWith(licensee)
    expect(pedidos10.signOrderWebhook).toHaveBeenCalled()
    expect(response).toEqual({ message: WEBHOOK_SIGNED_MESSAGE })
  })

  it('returns the not-signed message when pedidos10 integration data is missing', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const pedidos10 = {
      signOrderWebhook: jest.fn(),
    }
    const createPedidos10 = jest.fn().mockReturnValue(pedidos10)
    const signPedidos10OrderWebhook = new SignPedidos10OrderWebhook({ licenseeRepository, createPedidos10 })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ pedidos10_integration: {} }))

    const response = await signPedidos10OrderWebhook.execute(licensee._id)

    expect(createPedidos10).not.toHaveBeenCalled()
    expect(pedidos10.signOrderWebhook).not.toHaveBeenCalled()
    expect(response).toEqual({ message: WEBHOOK_NOT_SIGNED_MESSAGE })
  })
})
