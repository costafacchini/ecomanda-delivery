const processBackgroundjobInviteCreditCard = require('./ProcessBackgroundjobInviteCreditCard')
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

describe('processBackgroundjobInviteCreditCard', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('calls to pagar.me API to create credit card', async () => {
    const createCreditCardFnSpy = jest.spyOn(Card.prototype, 'create').mockImplementation(async () => {})

    const licensee = await Licensee.create(licenseeFactory.build())
    const backgroundjob = await Backgroundjob.create(
      backgroundjobFactory.build({
        kind: 'invite-credit-card',
        body: {
          cart_id: 'cart-id',
          credit_card_data: {
            number: '1234567890123456',
            holder_name: 'John Doe',
            exp_month: 10,
            exp_year: 2029,
            cvv: 123,
          },
        },
        licensee,
      }),
    )
    const contact = await Contact.create(contactFactory.build({ licensee }))
    const cart = await Cart.create(cartFactory.build({ contact, licensee }))

    const data = {
      cart_id: cart._id,
      credit_card_data: {
        number: '1234567890123456',
        holder_name: 'John Doe',
        exp_month: 10,
        exp_year: 2029,
        cvv: 123,
      },
      jobId: backgroundjob._id,
    }

    await processBackgroundjobInviteCreditCard(data)

    expect(createCreditCardFnSpy).toHaveBeenCalled()
  })

  describe('when success', () => {
    it('returns the request data information at backgroundjob', async () => {
      const createCreditCardFnSpy = jest.spyOn(Card.prototype, 'create').mockImplementation(() => {
        return { success: true }
      })

      const licensee = await Licensee.create(licenseeFactory.build())
      const backgroundjob = await Backgroundjob.create(
        backgroundjobFactory.build({
          kind: 'invite-credit-card',
          body: {
            cart_id: 'cart-id',
            credit_card_data: {
              number: '1234567890123456',
              holder_name: 'John Doe',
              exp_month: 10,
              exp_year: 2029,
              cvv: 123,
            },
          },
          licensee,
        }),
      )

      const contact = await Contact.create(contactFactory.build({ licensee }))
      const cart = await Cart.create(cartFactory.build({ contact, licensee }))

      const data = {
        cart_id: cart._id,
        credit_card_data: {
          number: '1234567890123456',
          holder_name: 'John Doe',
          exp_month: 10,
          exp_year: 2029,
          cvv: 123,
        },
        jobId: backgroundjob._id,
      }

      await processBackgroundjobInviteCreditCard(data)

      const backgroundjobUpdated = await Backgroundjob.findById(backgroundjob)
      expect(backgroundjobUpdated.status).toEqual('done')
      expect(backgroundjobUpdated.response).toEqual({
        status: 'done',
      })

      createCreditCardFnSpy.mockRestore()
    })
  })

  describe('when error', () => {
    it('saves the error information at backgroundjob', async () => {
      const createCreditCardFnSpy = jest.spyOn(Card.prototype, 'create').mockImplementation(() => {
        return {
          success: false,
          error: 'error message',
        }
      })

      const licensee = await Licensee.create(licenseeFactory.build())
      const backgroundjob = await Backgroundjob.create(
        backgroundjobFactory.build({
          kind: 'invite-credit-card',
          body: {
            cart_id: 'cart-id',
            credit_card_data: {
              number: '1234567890123456',
              holder_name: 'John Doe',
              exp_month: 10,
              exp_year: 2029,
              cvv: 123,
            },
          },
          licensee,
        }),
      )

      const contact = await Contact.create(contactFactory.build({ licensee }))
      const cart = await Cart.create(cartFactory.build({ contact, licensee }))

      const data = {
        cart_id: cart._id,
        credit_card_data: {
          number: '1234567890123456',
          holder_name: 'John Doe',
          exp_month: 10,
          exp_year: 2029,
          cvv: 123,
        },
        jobId: backgroundjob._id,
      }

      await processBackgroundjobInviteCreditCard(data)

      const backgroundjobUpdated = await Backgroundjob.findById(backgroundjob)
      expect(backgroundjobUpdated.status).toEqual('error')
      expect(backgroundjobUpdated.error).toEqual('Error: O cadastro do cartão não deu certo error message')

      createCreditCardFnSpy.mockRestore()
    })
  })
})
