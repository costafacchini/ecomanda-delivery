const processBackgroundjobGetPix = require('./ProcessBackgroundjobGetPix')
const Backgroundjob = require('@models/Backgroundjob')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { backgroundjob: backgroundjobFactory } = require('@factories/backgroundjob')
const { cart: cartFactory } = require('@factories/cart')
const { contact: contactFactory } = require('@factories/contact')
const Payment = require('@plugins/payments/PagarMe/Payment')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')
const { ContactRepositoryDatabase } = require('@repositories/contact')
const { CartRepositoryDatabase } = require('@repositories/cart')

describe('processBackgroundjobGetPix', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('calls to pagar.me API to generate pix', async () => {
    const paymentCreateFnSpy = jest.spyOn(Payment.prototype, 'createPIX').mockImplementation(() => {})

    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(licenseeFactory.build())
    const backgroundjob = await Backgroundjob.create(
      backgroundjobFactory.build({
        kind: 'get-pix',
        body: {
          cart_id: 'cart-id',
        },
        licensee,
      }),
    )

    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.create(contactFactory.build({ licensee }))

    const cartRepository = new CartRepositoryDatabase()
    const cart = await cartRepository.create(cartFactory.build({ contact, licensee }))

    const data = {
      cart_id: cart._id,
      jobId: backgroundjob._id,
    }

    await processBackgroundjobGetPix(data)

    expect(paymentCreateFnSpy).toHaveBeenCalled()
  })

  describe('when success', () => {
    it('saves the pix information at backgroundjob', async () => {
      jest.spyOn(Payment.prototype, 'createPIX').mockImplementation(async () => {
        cart.pix_qrcode = '00020101021226480019BR.COM.STONE.QRCODE0108A37F8712020912345678927820'
        cart.pix_url = 'https://www.imagem.com.br/pix.jpg'

        await cart.save()
      })

      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const backgroundjob = await Backgroundjob.create(
        backgroundjobFactory.build({
          kind: 'get-pix',
          body: {
            cart_id: 'cart-id',
          },
          licensee,
        }),
      )

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee }))

      const cartRepository = new CartRepositoryDatabase()
      const cart = await cartRepository.create(cartFactory.build({ contact, licensee }))

      const data = {
        cart_id: cart._id,
        jobId: backgroundjob._id,
      }

      await processBackgroundjobGetPix(data)

      const backgroundjobUpdated = await Backgroundjob.findById(backgroundjob)
      expect(backgroundjobUpdated.status).toEqual('done')
      expect(backgroundjobUpdated.response).toEqual({
        qrcode: '00020101021226480019BR.COM.STONE.QRCODE0108A37F8712020912345678927820',
        qrcode_img_url: 'https://www.imagem.com.br/pix.jpg',
      })
    })
  })

  describe('when error', () => {
    it('saves the pix information at backgroundjob', async () => {
      jest.spyOn(Payment.prototype, 'createPIX').mockImplementation(() => {
        throw new Error('some error')
      })

      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const backgroundjob = await Backgroundjob.create(
        backgroundjobFactory.build({
          kind: 'get-pix',
          body: {
            cart_id: 'cart-id',
          },
          licensee,
        }),
      )

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee }))

      const cartRepository = new CartRepositoryDatabase()
      const cart = await cartRepository.create(cartFactory.build({ contact, licensee }))

      const data = {
        cart_id: cart._id,
        jobId: backgroundjob._id,
      }

      await processBackgroundjobGetPix(data)

      const backgroundjobUpdated = await Backgroundjob.findById(backgroundjob)
      expect(backgroundjobUpdated.status).toEqual('error')
      expect(backgroundjobUpdated.error).toEqual('Error: some error')
    })
  })
})
