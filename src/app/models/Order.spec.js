import Order from '@models/Order.js'
import Licensee from '@models/Licensee.js'
import mongoServer from '../../../.jest/utils.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { order as orderFactory   } from '@factories/order.js'

describe('Order', () => {
  let licensee

  beforeEach(async () => {
    await mongoServer.connect()

    licensee = await Licensee.create(licenseeFactory.build())
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const order = await Order.create(orderFactory.build({ licensee }))

      expect(order._id).not.toEqual(null)
    })

    it('does not changes _id if order is changed', async () => {
      const order = await Order.create(orderFactory.build({ licensee }))

      order.status = 'Changed'
      const alteredOrder = await order.save()

      expect(order._id).toEqual(alteredOrder._id)
      expect(alteredOrder.status).toEqual('Changed')
    })

    it('fills the fields that have a default value', () => {
      const order = new Order()

      expect(order.total_items).toEqual(0)
      expect(order.total_fees).toEqual(0)
      expect(order.total_discount).toEqual(0)
      expect(order.total_addition).toEqual(0)
      expect(order.total).toEqual(0)
    })
  })

  describe('validations', () => {
    describe('licensee', () => {
      it('is required', () => {
        const order = new Order()
        const validation = order.validateSync()

        expect(validation.errors['licensee'].message).toEqual('Licensee: Você deve preencher o campo')
      })
    })
  })
})
