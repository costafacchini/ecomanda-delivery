const processPagarmeOrderPaid = require('./ProcessPagarmeOrderPaid')
const Licensee = require('@models/Licensee')
const Cart = require('@models/Cart')
const Contact = require('@models/Contact')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { cart: cartFactory } = require('@factories/cart')
const { contact: contactFactory } = require('@factories/contact')

describe('processPagarmeOrderPaid', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('updates the cart payment status and integration status information', async () => {
    const licensee = await Licensee.create(licenseeFactory.build())
    const contact = await Contact.create(contactFactory.build({ licensee }))
    const cart = await Cart.create(
      cartFactory.build({
        contact,
        licensee,
        order_id: 'pagarme-id',
        payment_status: 'pending',
        integration_status: 'waiting-payment',
      })
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

    const cartUpdated = await Cart.findById(cart)
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
      'Carrinho não encontrado referente ao pagamento pagarme-id da pagar.me!'
    )

    consoleInfoSpy.mockRestore()
  })
})
