const processBackgroundjobChargeCreditCard = require('./ProcessBackgroundjobChargeCreditCard')
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

describe('processBackgroundjobChargeCreditCard', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('calls to pagar.me API to get credit card data', async () => {
    const createCreditCardFnSpy = jest.spyOn(Payment.prototype, 'createCreditCard').mockImplementation(async () => {
      cart.payment_status = 'authorized_pending_capture'

      await cart.save()
    })

    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(licenseeFactory.build())
    const backgroundjob = await Backgroundjob.create(
      backgroundjobFactory.build({
        kind: 'get-credit-card',
        body: {
          cart_id: 'cart-id',
          credit_card_data: {
            first_six_digits: '123456',
            last_four_digits: '9876',
            brand: 'Mastercard',
          },
        },
        licensee,
      }),
    )
    const contact = await Contact.create(
      contactFactory.build({
        licensee,
        credit_cards: [
          {
            first_six_digits: '123456',
            last_four_digits: '9876',
            brand: 'Mastercard',
            credit_card_id: 'card_3dlyaY6SPSb',
          },
        ],
      }),
    )
    const cart = await Cart.create(cartFactory.build({ contact, licensee }))

    const data = {
      cart_id: cart._id,
      credit_card_data: {
        first_six_digits: '123456',
        last_four_digits: '9876',
        brand: 'Mastercard',
      },
      jobId: backgroundjob._id,
    }

    await processBackgroundjobChargeCreditCard(data)

    expect(createCreditCardFnSpy).toHaveBeenCalled()
  })

  describe('when success', () => {
    it('saves the credit cards information at backgroundjob', async () => {
      const createCreditCardFnSpy = jest.spyOn(Payment.prototype, 'createCreditCard').mockImplementation(async () => {
        cart.payment_status = 'authorized_pending_capture'

        await cart.save()
      })

      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const backgroundjob = await Backgroundjob.create(
        backgroundjobFactory.build({
          kind: 'get-credit-card',
          body: {
            cart_id: 'cart-id',
            credit_card_data: {
              first_six_digits: '123456',
              last_four_digits: '9876',
              brand: 'Mastercard',
            },
          },
          licensee,
        }),
      )

      const contact = await Contact.create(
        contactFactory.build({
          licensee,
          credit_cards: [
            {
              first_six_digits: '123456',
              last_four_digits: '9876',
              brand: 'Mastercard',
              credit_card_id: 'card_3dlyaY6SPSb',
            },
          ],
        }),
      )
      const cart = await Cart.create(cartFactory.build({ contact, licensee }))

      const data = {
        cart_id: cart._id,
        credit_card_data: {
          first_six_digits: '123456',
          last_four_digits: '9876',
          brand: 'Mastercard',
        },
        jobId: backgroundjob._id,
      }

      await processBackgroundjobChargeCreditCard(data)

      const backgroundjobUpdated = await Backgroundjob.findById(backgroundjob)
      expect(backgroundjobUpdated.status).toEqual('done')
      expect(backgroundjobUpdated.response).toEqual({
        status: 'authorized_pending_capture',
      })

      createCreditCardFnSpy.mockRestore()
    })
  })

  describe('when error', () => {
    describe('when card do not belong to contact', () => {
      it('saves the error information at backgroundjob', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())
        const backgroundjob = await Backgroundjob.create(
          backgroundjobFactory.build({
            kind: 'get-credit-card',
            body: {
              cart_id: 'cart-id',
              credit_card_data: {
                first_six_digits: '123456',
                last_four_digits: '9876',
                brand: 'Mastercard',
              },
            },
            licensee,
          }),
        )

        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            licensee,
            credit_cards: [
              {
                first_six_digits: '999987',
                last_four_digits: '9876',
                brand: 'Mastercard',
                credit_card_id: 'card_3dlyaY6SPSb',
              },
            ],
          }),
        )
        const cart = await Cart.create(cartFactory.build({ contact, licensee }))

        const data = {
          cart_id: cart._id,
          credit_card_data: {
            first_six_digits: '123456',
            last_four_digits: '9876',
            brand: 'Mastercard',
          },
          jobId: backgroundjob._id,
        }

        await processBackgroundjobChargeCreditCard(data)

        const backgroundjobUpdated = await Backgroundjob.findById(backgroundjob)
        expect(backgroundjobUpdated.status).toEqual('error')
        expect(backgroundjobUpdated.error).toEqual(
          'Error: O cartão 123456******9876 não consta nos dados de John Doe 5511990283745!',
        )
      })
    })

    describe('when payment status is not_authorized', () => {
      it('saves the error information at backgroundjob', async () => {
        const createCreditCardFnSpy = jest.spyOn(Payment.prototype, 'createCreditCard').mockImplementation(async () => {
          cart.payment_status = 'not_authorized'

          await cart.save()
        })

        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())
        const backgroundjob = await Backgroundjob.create(
          backgroundjobFactory.build({
            kind: 'get-credit-card',
            body: {
              cart_id: 'cart-id',
              credit_card_data: {
                first_six_digits: '123456',
                last_four_digits: '9876',
                brand: 'Mastercard',
              },
            },
            licensee,
          }),
        )

        const contact = await Contact.create(
          contactFactory.build({
            licensee,
            credit_cards: [
              {
                first_six_digits: '123456',
                last_four_digits: '9876',
                brand: 'Mastercard',
                credit_card_id: 'card_3dlyaY6SPSb',
              },
            ],
          }),
        )
        const cart = await Cart.create(cartFactory.build({ contact, licensee }))

        const data = {
          cart_id: cart._id,
          credit_card_data: {
            first_six_digits: '123456',
            last_four_digits: '9876',
            brand: 'Mastercard',
          },
          jobId: backgroundjob._id,
        }

        await processBackgroundjobChargeCreditCard(data)

        const backgroundjobUpdated = await Backgroundjob.findById(backgroundjob)
        expect(backgroundjobUpdated.status).toEqual('error')
        expect(backgroundjobUpdated.error).toEqual(
          'Error: O pagamento não deu certo, retornou com status not_authorized',
        )

        createCreditCardFnSpy.mockRestore()
      })
    })

    describe('when payment status is failed', () => {
      it('saves the error information at backgroundjob', async () => {
        const createCreditCardFnSpy = jest.spyOn(Payment.prototype, 'createCreditCard').mockImplementation(async () => {
          cart.payment_status = 'failed'

          await cart.save()
        })

        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())
        const backgroundjob = await Backgroundjob.create(
          backgroundjobFactory.build({
            kind: 'get-credit-card',
            body: {
              cart_id: 'cart-id',
              credit_card_data: {
                first_six_digits: '123456',
                last_four_digits: '9876',
                brand: 'Mastercard',
              },
            },
            licensee,
          }),
        )

        const contact = await Contact.create(
          contactFactory.build({
            licensee,
            credit_cards: [
              {
                first_six_digits: '123456',
                last_four_digits: '9876',
                brand: 'Mastercard',
                credit_card_id: 'card_3dlyaY6SPSb',
              },
            ],
          }),
        )
        const cart = await Cart.create(cartFactory.build({ contact, licensee }))

        const data = {
          cart_id: cart._id,
          credit_card_data: {
            first_six_digits: '123456',
            last_four_digits: '9876',
            brand: 'Mastercard',
          },
          jobId: backgroundjob._id,
        }

        await processBackgroundjobChargeCreditCard(data)

        const backgroundjobUpdated = await Backgroundjob.findById(backgroundjob)
        expect(backgroundjobUpdated.status).toEqual('error')
        expect(backgroundjobUpdated.error).toEqual('Error: O pagamento não deu certo, retornou com status failed')

        createCreditCardFnSpy.mockRestore()
      })
    })

    describe('when payment status is with_error', () => {
      it('saves the error information at backgroundjob', async () => {
        const createCreditCardFnSpy = jest.spyOn(Payment.prototype, 'createCreditCard').mockImplementation(async () => {
          cart.payment_status = 'with_error'

          await cart.save()
        })

        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())
        const backgroundjob = await Backgroundjob.create(
          backgroundjobFactory.build({
            kind: 'get-credit-card',
            body: {
              cart_id: 'cart-id',
              credit_card_data: {
                first_six_digits: '123456',
                last_four_digits: '9876',
                brand: 'Mastercard',
              },
            },
            licensee,
          }),
        )

        const contact = await Contact.create(
          contactFactory.build({
            licensee,
            credit_cards: [
              {
                first_six_digits: '123456',
                last_four_digits: '9876',
                brand: 'Mastercard',
                credit_card_id: 'card_3dlyaY6SPSb',
              },
            ],
          }),
        )
        const cart = await Cart.create(cartFactory.build({ contact, licensee }))

        const data = {
          cart_id: cart._id,
          credit_card_data: {
            first_six_digits: '123456',
            last_four_digits: '9876',
            brand: 'Mastercard',
          },
          jobId: backgroundjob._id,
        }

        await processBackgroundjobChargeCreditCard(data)

        const backgroundjobUpdated = await Backgroundjob.findById(backgroundjob)
        expect(backgroundjobUpdated.status).toEqual('error')
        expect(backgroundjobUpdated.error).toEqual('Error: O pagamento não deu certo, retornou com status with_error')

        createCreditCardFnSpy.mockRestore()
      })
    })

    describe('when payment status is voided', () => {
      it('saves the error information at backgroundjob', async () => {
        const createCreditCardFnSpy = jest.spyOn(Payment.prototype, 'createCreditCard').mockImplementation(async () => {
          cart.payment_status = 'voided'

          await cart.save()
        })

        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())
        const backgroundjob = await Backgroundjob.create(
          backgroundjobFactory.build({
            kind: 'get-credit-card',
            body: {
              cart_id: 'cart-id',
              credit_card_data: {
                first_six_digits: '123456',
                last_four_digits: '9876',
                brand: 'Mastercard',
              },
            },
            licensee,
          }),
        )

        const contact = await Contact.create(
          contactFactory.build({
            licensee,
            credit_cards: [
              {
                first_six_digits: '123456',
                last_four_digits: '9876',
                brand: 'Mastercard',
                credit_card_id: 'card_3dlyaY6SPSb',
              },
            ],
          }),
        )
        const cart = await Cart.create(cartFactory.build({ contact, licensee }))

        const data = {
          cart_id: cart._id,
          credit_card_data: {
            first_six_digits: '123456',
            last_four_digits: '9876',
            brand: 'Mastercard',
          },
          jobId: backgroundjob._id,
        }

        await processBackgroundjobChargeCreditCard(data)

        const backgroundjobUpdated = await Backgroundjob.findById(backgroundjob)
        expect(backgroundjobUpdated.status).toEqual('error')
        expect(backgroundjobUpdated.error).toEqual('Error: O pagamento não deu certo, retornou com status voided')

        createCreditCardFnSpy.mockRestore()
      })
    })
  })
})
