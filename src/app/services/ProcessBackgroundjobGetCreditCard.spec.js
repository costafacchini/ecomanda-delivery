import processBackgroundjobGetCreditCard from './ProcessBackgroundjobGetCreditCard.js'
import Backgroundjob from '@models/Backgroundjob.js'
import mongoServer from '.jest/utils.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { backgroundjob as backgroundjobFactory   } from '@factories/backgroundjob.js'
import { cart as cartFactory   } from '@factories/cart.js'
import { contact as contactFactory   } from '@factories/contact.js'
import Card from '@plugins/payments/PagarMe/Card.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'
import { ContactRepositoryDatabase  } from '@repositories/contact.js'
import { CartRepositoryDatabase  } from '@repositories/cart.js'

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

    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(licenseeFactory.build())
    const backgroundjob = await Backgroundjob.create(
      backgroundjobFactory.build({
        kind: 'get-credit-card',
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

      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const backgroundjob = await Backgroundjob.create(
        backgroundjobFactory.build({
          kind: 'get-credit-card',
          body: {
            cart_id: 'cart-id',
          },
          licensee,
        }),
      )

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(
        contactFactory.build({ licensee, credit_card_id: 'card_3dlyaP9KWSb' }),
      )

      const cartRepository = new CartRepositoryDatabase()
      const cart = await cartRepository.create(cartFactory.build({ contact, licensee }))

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

    it('saves the credit cards information at contact', async () => {
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

      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const backgroundjob = await Backgroundjob.create(
        backgroundjobFactory.build({
          kind: 'get-credit-card',
          body: {
            cart_id: 'cart-id',
          },
          licensee,
        }),
      )

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(
        contactFactory.build({ licensee, credit_card_id: 'card_3dlyaP9KWSb' }),
      )

      const cartRepository = new CartRepositoryDatabase()
      const cart = await cartRepository.create(cartFactory.build({ contact, licensee }))

      const data = {
        cart_id: cart._id,
        jobId: backgroundjob._id,
      }

      await processBackgroundjobGetCreditCard(data)

      const contactUpdated = await contactRepository.findFirst({ _id: contact })

      expect(contactUpdated.credit_cards.length).toEqual(2)

      expect(contactUpdated.credit_cards[0].brand).toEqual('Mastercard')
      expect(contactUpdated.credit_cards[0].first_six_digits).toEqual('123412')
      expect(contactUpdated.credit_cards[0].last_four_digits).toEqual('1234')
      expect(contactUpdated.credit_cards[0].credit_card_id).toEqual('card_3dlyaY6SPSb')
    })
  })

  describe('when error', () => {
    it('saves the error information at backgroundjob', async () => {
      jest.spyOn(Card.prototype, 'list').mockImplementation(() => {
        throw new Error('some error')
      })

      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const backgroundjob = await Backgroundjob.create(
        backgroundjobFactory.build({
          kind: 'get-credit-card',
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

      await processBackgroundjobGetCreditCard(data)

      const backgroundjobUpdated = await Backgroundjob.findById(backgroundjob)
      expect(backgroundjobUpdated.status).toEqual('error')
      expect(backgroundjobUpdated.error).toEqual('Error: some error')
    })
  })
})
