const Licensee = require('@models/Licensee')
const Order = require('@models/Order')
const mongoServer = require('../../../.jest/utils')
const { createOrder, getOrderBy } = require('@repositories/order')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { order: orderFactory } = require('@factories/order')

describe('order repository', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#createOrder', () => {
    it('creates a order', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())
      const draftOrder = orderFactory.build({ licensee })

      const order = await createOrder({
        ...draftOrder,
      })

      expect(order.merchant_external_code).toEqual('358b9068-34cf-4f96-b883-0d8192bc12dd')
      expect(order.order_external_id).toEqual('9967816')
      expect(order.type).toEqual('TAKEOUT')
      expect(order.display_id).toEqual('1#9967816')
      expect(order.status).toEqual('CONFIRMED')
      expect(order.customer_information.id).toEqual('14246')
      expect(order.customer_information.name).toEqual('Anderson Felizari')
      expect(order.customer_information.phone).toEqual('47988044298')
      expect(order.customer_information.document).toEqual('05798820980')
      expect(order.total_items).toEqual(5)
      expect(order.total_fees).toEqual(3)
      expect(order.total_discount).toEqual(2)
      expect(order.total_addition).toEqual(1)
      expect(order.total).toEqual(7)
      expect(order.payments.pending).toEqual(7)
      expect(order.payments.prepaid).toEqual(0)
      expect(order.payments.methods[0].value).toEqual(7)
      expect(order.payments.methods[0].type).toEqual('PENDING')
      expect(order.payments.methods[0].method).toEqual('CASH')
      expect(order.takeout.mode).toEqual('DEFAULT')
      expect(order.takeout.takeout_minutes).toEqual(25)
      expect(order.items[0].id).toEqual('17628924')
      expect(order.items[0].product_id).toEqual('280089')
      expect(order.items[0].name).toEqual('Refrigerante 600ml')
      expect(order.items[0].unit).toEqual('UNIT')
      expect(order.items[0].description).toEqual('Coca-Cola')
      expect(order.items[0].quantity).toEqual(1)
      expect(order.items[0].unit_price).toEqual(5)
      expect(order.items[0].total_price).toEqual(5)
      expect(order.items[0].option_groups[0].id).toEqual('27652021')
      expect(order.items[0].option_groups[0].group_id).toEqual('I392901')
      expect(order.items[0].option_groups[0].name).toEqual('Bebida')
      expect(order.items[0].option_groups[0].define_value).toEqual(true)
      expect(order.items[0].option_groups[0].options[0].id).toEqual('52007400')
      expect(order.items[0].option_groups[0].options[0].option_id).toEqual('I981750')
      expect(order.items[0].option_groups[0].options[0].name).toEqual('Coca-Cola')
      expect(order.items[0].option_groups[0].options[0].unit).toEqual('UNIT')
      expect(order.items[0].option_groups[0].options[0].quantity).toEqual(1)
      expect(order.items[0].option_groups[0].options[0].total).toEqual(5)
    })
  })

  describe('#getOrderBy', () => {
    it('returns one record by filter', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())
      const draftOrder = orderFactory.build({ licensee })

      await createOrder({
        ...draftOrder,
      })

      const anotherLicensee = await Licensee.create(licenseeFactory.build())
      const anotherDraftOrder = orderFactory.build({ licensee: anotherLicensee })
      await createOrder({
        ...anotherDraftOrder,
      })

      const cart = await getOrderBy({ licensee })

      expect(cart).toEqual(
        expect.objectContaining({
          licensee: licensee._id,
        }),
      )

      expect(cart).not.toEqual(
        expect.objectContaining({
          licensee: anotherLicensee._id,
        }),
      )
    })
  })
})
