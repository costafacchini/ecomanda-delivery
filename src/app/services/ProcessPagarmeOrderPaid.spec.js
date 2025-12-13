import { processPagarmeOrderPaid } from './ProcessPagarmeOrderPaid.js'
import mongoServer from '.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { cart as cartFactory } from '@factories/cart'
import { contact as contactFactory } from '@factories/contact'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { CartRepositoryDatabase } from '@repositories/cart'
import { logger } from '../../setup/logger.js'

jest.mock('../../setup/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  },
}))

describe('processPagarmeOrderPaid', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('updates the cart payment status and integration status information', async () => {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(licenseeFactory.build())

    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.create(contactFactory.build({ licensee }))

    const cartRepository = new CartRepositoryDatabase()
    const cart = await cartRepository.create(
      cartFactory.build({
        contact,
        licensee,
        order_id: 'pagarme-id',
        payment_status: 'pending',
        integration_status: 'waiting-payment',
      }),
    )

    const body = {
      data: {
        id: 'pagarme-id',
        status: 'paid',
        charges: [
          {
            id: 'ch_d22356Jf4WuGr8no',
            status: 'paid-2',
          },
        ],
      },
    }

    await processPagarmeOrderPaid(body)

    const cartUpdated = await cartRepository.findFirst({ _id: cart._id })
    expect(cartUpdated.payment_status).toEqual('paid-2')
    expect(cartUpdated.integration_status).toEqual('paid')
  })

  it('logs message when cart is not found', async () => {
    const loggerInfoSpy = logger.info

    const body = {
      data: {
        id: 'pagarme-id',
        status: 'paid',
        charges: [
          {
            id: 'ch_d22356Jf4WuGr8no',
            status: 'paid-2',
          },
        ],
      },
    }

    await processPagarmeOrderPaid(body)

    expect(loggerInfoSpy).toHaveBeenCalledTimes(1)
    expect(loggerInfoSpy).toHaveBeenCalledWith('Carrinho não encontrado referente ao pagamento pagarme-id da pagar.me!')
  })
})
