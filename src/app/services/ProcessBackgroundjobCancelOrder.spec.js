const processBackgroundjobCancelOrder = require('./ProcessBackgroundjobCancelOrder')
const Backgroundjob = require('@models/Backgroundjob')
const Cart = require('@models/Cart')
const Contact = require('@models/Contact')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { backgroundjob: backgroundjobFactory } = require('@factories/backgroundjob')
const { cart: cartFactory } = require('@factories/cart')
const { contact: contactFactory } = require('@factories/contact')
const Payment = require('@plugins/payments/PagarMe/Payment')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')

describe('processBackgroundjobCancelOrder', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('calls to pagar.me API to cancel charge payment', async () => {
    const paymentDeleteFnSpy = jest.spyOn(Payment.prototype, 'delete').mockImplementation(() => {})

    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(licenseeFactory.build())
    const backgroundjob = await Backgroundjob.create(
      backgroundjobFactory.build({
        kind: 'cancel-order',
        body: {
          cart_id: 'cart-id',
        },
        licensee,
      }),
    )
    const contact = await Contact.create(contactFactory.build({ licensee }))
    const cart = await Cart.create(cartFactory.build({ contact, licensee }))

    const data = {
      cart_id: cart._id,
      jobId: backgroundjob._id,
    }

    await processBackgroundjobCancelOrder(data)

    expect(paymentDeleteFnSpy).toHaveBeenCalled()
  })

  describe('when success', () => {
    it('saves the cancel information at backgroundjob', async () => {
      jest.spyOn(Payment.prototype, 'delete').mockImplementation(async () => {
        cart.payment_status = 'voided'

        await cart.save()
      })

      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const backgroundjob = await Backgroundjob.create(
        backgroundjobFactory.build({
          kind: 'cancel-order',
          body: {
            cart_id: 'cart-id',
          },
          licensee,
        }),
      )

      const contact = await Contact.create(contactFactory.build({ licensee }))
      const cart = await Cart.create(cartFactory.build({ contact, licensee }))

      const data = {
        cart_id: cart._id,
        jobId: backgroundjob._id,
      }

      await processBackgroundjobCancelOrder(data)

      const backgroundjobUpdated = await Backgroundjob.findById(backgroundjob)
      expect(backgroundjobUpdated.status).toEqual('done')
      expect(backgroundjobUpdated.response).toEqual({ payment_status: 'voided' })
    })
  })

  describe('when error', () => {
    it('saves the error information at backgroundjob', async () => {
      jest.spyOn(Payment.prototype, 'delete').mockImplementation(() => {
        throw new Error('some error')
      })

      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const backgroundjob = await Backgroundjob.create(
        backgroundjobFactory.build({
          kind: 'cancel-order',
          body: {
            cart_id: 'cart-id',
          },
          licensee,
        }),
      )

      const contact = await Contact.create(contactFactory.build({ licensee }))
      const cart = await Cart.create(cartFactory.build({ contact, licensee }))

      const data = {
        cart_id: cart._id,
        jobId: backgroundjob._id,
      }

      await processBackgroundjobCancelOrder(data)

      const backgroundjobUpdated = await Backgroundjob.findById(backgroundjob)
      expect(backgroundjobUpdated.status).toEqual('error')
      expect(backgroundjobUpdated.error).toEqual('Error: some error')
    })
  })
})
