import mongoServer from '../../../.jest/utils'
import { OrderRepositoryDatabase } from '@repositories/order'
import { licensee as licenseeFactory } from '@factories/licensee'
import { order as orderFactory } from '@factories/order'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'

describe('order repository', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#create', () => {
    it('creates a new order', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const orderRepository = new OrderRepositoryDatabase()
      const order = await orderRepository.create(orderFactory.build({ licensee }))

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

    describe('when is invalid order', () => {
      it('generate exception with error', async () => {
        const orderRepository = new OrderRepositoryDatabase()

        await expect(async () => {
          await orderRepository.create()
        }).rejects.toThrow('Order validation failed: licensee: Licensee: Você deve preencher o campo')
      })
    })
  })

  describe('#findFirst', () => {
    it('finds a order', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const orderRepository = new OrderRepositoryDatabase()
      await orderRepository.create(orderFactory.build({ licensee, order_external_id: '9967816' }))
      await orderRepository.create(orderFactory.build({ licensee, order_external_id: '9999999' }))

      let result = await orderRepository.findFirst()
      expect(result).toEqual(expect.objectContaining({ order_external_id: '9967816' }))

      result = await orderRepository.findFirst({ order_external_id: '9999999' }, ['licensee'])
      expect(result).toEqual(expect.objectContaining({ order_external_id: '9999999' }))
      expect(result.licensee.name).toEqual('Alcateia Ltds')
    })
  })
})
