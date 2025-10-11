import processBackgroundjob from './ProcessBackgroundjob'
import Backgroundjob from '@models/Backgroundjob'
import mongoServer from '.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { cart as cartFactory } from '@factories/cart'
import { contact as contactFactory } from '@factories/contact'
import { backgroundjob as backgroundjobFactory } from '@factories/backgroundjob'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { CartRepositoryDatabase } from '@repositories/cart'
import { ContactRepositoryDatabase } from '@repositories/contact'

describe('processBackgroundjob', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('when backgroundjob has cart_id', () => {
    it('responds with action with backgroundjob kind', async () => {
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

      const data = {
        jobId: backgroundjob._id,
      }

      const actions = await processBackgroundjob(data)

      expect(actions[0].action).toEqual('process-backgroundjob-get-pix')
      expect(actions[0].body).toEqual({
        cart_id: 'cart-id',
        jobId: backgroundjob._id,
      })

      expect(actions.length).toEqual(1)
    })
  })

  describe('when backgroundjob has contact', () => {
    describe('when contact has cart', () => {
      it('responds with action with backgroundjob kind and cart_id', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(contactFactory.build({ licensee }))

        const cartRepository = new CartRepositoryDatabase()
        const cart = await cartRepository.create(cartFactory.build({ contact, licensee }))

        const backgroundjob = await Backgroundjob.create({
          status: 'scheduled',
          kind: 'get-pix',
          body: {
            contact: '5511990283745',
          },
          licensee,
        })

        const data = {
          jobId: backgroundjob._id,
        }

        const actions = await processBackgroundjob(data)

        expect(actions[0].action).toEqual('process-backgroundjob-get-pix')
        expect(actions[0].body).toEqual({
          contact: '5511990283745',
          cart_id: cart._id,
          jobId: backgroundjob._id,
        })

        expect(actions.length).toEqual(1)
      })
    })

    describe('when contact has no cart opened', () => {
      it('saves error information at backgroundjob', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(contactFactory.build({ licensee }))

        const cartRepository = new CartRepositoryDatabase()
        await cartRepository.create(cartFactory.build({ contact, licensee, concluded: true }))

        const backgroundjob = await Backgroundjob.create({
          status: 'scheduled',
          kind: 'get-pix',
          body: {
            contact: '5511990283745',
          },
          licensee,
        })

        const data = {
          jobId: backgroundjob._id,
        }

        await processBackgroundjob(data)

        const backgroundjobUpdated = await Backgroundjob.findById(backgroundjob)
        expect(backgroundjobUpdated.status).toEqual('error')
        expect(backgroundjobUpdated.error).toEqual('O job precisa ter ou um contato ou um carrinho válido!')
      })
    })
  })

  describe('when backgroundjob has no cart_id and contact', () => {
    describe('and has no contact', () => {
      it('saves error information at backgroundjob', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())
        const backgroundjob = await Backgroundjob.create({
          status: 'scheduled',
          kind: 'get-pix',
          body: {
            nothing: 'aaa',
          },
          licensee,
        })

        const data = {
          jobId: backgroundjob._id,
        }

        await processBackgroundjob(data)

        const backgroundjobUpdated = await Backgroundjob.findById(backgroundjob)
        expect(backgroundjobUpdated.status).toEqual('error')
        expect(backgroundjobUpdated.error).toEqual('O job precisa ter ou um contato ou um carrinho válido!')
      })
    })
  })
})
