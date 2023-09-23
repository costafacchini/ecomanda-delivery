const processBackgroundjobGetCreditCard = require('./ProcessBackgroundjobGetCreditCard')
const Licensee = require('@models/Licensee')
const Backgroundjob = require('@models/Backgroundjob')
const Cart = require('@models/Cart')
const Contact = require('@models/Contact')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { backgroundjob: backgroundjobFactory } = require('@factories/backgroundjob')
const { cart: cartFactory } = require('@factories/cart')
const { contact: contactFactory } = require('@factories/contact')
const Card = require('@plugins/payments/PagarMe/Card')

describe('processBackgroundjobGetCreditCard', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('calls to pagar.me API to get credit card data', async () => {
    const cardListFnSpy = jest.spyOn(Card.prototype, 'list').mockImplementation(() => {})

    const licensee = await Licensee.create(licenseeFactory.build())
    const backgroundjob = await Backgroundjob.create(
      backgroundjobFactory.build({
        kind: 'get-credit-card',
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

    await processBackgroundjobGetCreditCard(data)

    expect(cardListFnSpy).toHaveBeenCalled()
  })

  describe('when success', () => {
    it('saves the credit cards information at backgroundjob', async () => {
      jest.spyOn(Card.prototype, 'list').mockImplementation(() => {
        return [
          {
            id: 'card_3dlyaY6SPSb',
            first_six_digits: '123412',
            last_four_digits: '1234',
            brand: 'Mastercard',
            holder_name: 'John Doe',
            exp_month: 5,
            exp_year: 2025,
            status: 'active',
            type: 'credit',
            created_at: '2023-09-23T13:22:13Z',
            updated_at: '2023-09-23T13:22:13Z',
          },
          {
            id: 'card_3dlyaP9KWSb',
            first_six_digits: '987632',
            last_four_digits: '1234',
            brand: 'Visa',
            holder_name: 'John Doe',
            exp_month: 2,
            exp_year: 2027,
            status: 'active',
            type: 'credit',
            created_at: '2023-09-23T13:22:13Z',
            updated_at: '2023-09-23T13:22:13Z',
          },
        ]
      })

      const licensee = await Licensee.create(licenseeFactory.build())
      const backgroundjob = await Backgroundjob.create(
        backgroundjobFactory.build({
          kind: 'get-credit-card',
          body: {
            cart_id: 'cart-id',
          },
          licensee,
        }),
      )

      const contact = await Contact.create(contactFactory.build({ licensee, credit_card_id: 'card_3dlyaP9KWSb' }))
      const cart = await Cart.create(cartFactory.build({ contact, licensee }))

      const data = {
        cart_id: cart._id,
        jobId: backgroundjob._id,
      }

      await processBackgroundjobGetCreditCard(data)

      const backgroundjobUpdated = await Backgroundjob.findById(backgroundjob)
      expect(backgroundjobUpdated.status).toEqual('done')
      expect(backgroundjobUpdated.response).toEqual({
        credit_card_data: [
          {
            brand: 'Mastercard',
            exp_month: 5,
            exp_year: 2025,
            first_six_digits: '123412',
            last_four_digits: '1234',
            type: 'credit',
            last_card_used: false,
          },
          {
            brand: 'Visa',
            exp_month: 2,
            exp_year: 2027,
            first_six_digits: '987632',
            last_four_digits: '1234',
            type: 'credit',
            last_card_used: true,
          },
        ],
      })
    })
  })

  describe('when error', () => {
    it('saves the error information at backgroundjob', async () => {
      jest.spyOn(Card.prototype, 'list').mockImplementation(() => {
        throw new Error('some error')
      })

      const licensee = await Licensee.create(licenseeFactory.build())
      const backgroundjob = await Backgroundjob.create(
        backgroundjobFactory.build({
          kind: 'get-credit-card',
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

      await processBackgroundjobGetCreditCard(data)

      const backgroundjobUpdated = await Backgroundjob.findById(backgroundjob)
      expect(backgroundjobUpdated.status).toEqual('error')
      expect(backgroundjobUpdated.error).toEqual('Error: some error')
    })
  })
})
