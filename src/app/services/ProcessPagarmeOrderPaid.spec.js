const processPagarmeOrderPaid = require('./ProcessPagarmeOrderPaid')
const Contact = require('@models/Contact')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { cart: cartFactory } = require('@factories/cart')
const { contact: contactFactory } = require('@factories/contact')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')
const { CartRepositoryDatabase } = require('@repositories/cart')

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
    const contact = await Contact.create(contactFactory.build({ licensee }))

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
    const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation()

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

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      'Carrinho não encontrado referente ao pagamento pagarme-id da pagar.me!',
    )

    consoleInfoSpy.mockRestore()
  })
})
