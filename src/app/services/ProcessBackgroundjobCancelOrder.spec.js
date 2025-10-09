import processBackgroundjobCancelOrder from './ProcessBackgroundjobCancelOrder.js'
import Backgroundjob from '@models/Backgroundjob.js'
import mongoServer from '.jest/utils.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { backgroundjob as backgroundjobFactory   } from '@factories/backgroundjob.js'
import { cart as cartFactory   } from '@factories/cart.js'
import { contact as contactFactory   } from '@factories/contact.js'
import Payment from '@plugins/payments/PagarMe/Payment.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'
import { ContactRepositoryDatabase  } from '@repositories/contact.js'
import { CartRepositoryDatabase  } from '@repositories/cart.js'

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

    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.create(contactFactory.build({ licensee }))

    const cartRepository = new CartRepositoryDatabase()
    const cart = await cartRepository.create(cartFactory.build({ contact, licensee }))

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

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee }))

      const cartRepository = new CartRepositoryDatabase()
      const cart = await cartRepository.create(cartFactory.build({ contact, licensee }))

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

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee }))

      const cartRepository = new CartRepositoryDatabase()
      const cart = await cartRepository.create(cartFactory.build({ contact, licensee }))

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
