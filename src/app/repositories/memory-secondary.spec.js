import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { order as orderFactory } from '@factories/order'
import { RoomRepositoryMemory } from './room.js'
import { CartRepositoryMemory } from './cart.js'
import { OrderRepositoryMemory } from './order.js'
import { ProductRepositoryMemory } from './product.js'
import { LicenseeRepositoryMemory } from './licensee.js'
import { ContactRepositoryMemory } from './contact.js'

describe('memory repositories - secondary entities', () => {
  it('saves rooms and finds them by contact id', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const contactRepository = new ContactRepositoryMemory()
    const roomRepository = new RoomRepositoryMemory()

    const licensee = await licenseeRepository.create(licenseeFactory.build())
    const contact = await contactRepository.create(contactFactory.build({ licensee }))
    const room = await roomRepository.create({ roomId: 'room-1', contact })

    room.closed = true
    await roomRepository.save(room)

    expect(await roomRepository.findFirst({ contact: contact._id })).toEqual(
      expect.objectContaining({ roomId: 'room-1', closed: true }),
    )
  })

  it('updates carts in bulk with operator filters and deletes matching records', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const contactRepository = new ContactRepositoryMemory()
    const cartRepository = new CartRepositoryMemory()

    const licensee = await licenseeRepository.create(licenseeFactory.build())
    const contact = await contactRepository.create(contactFactory.build({ licensee }))

    await cartRepository.create({
      contact,
      licensee,
      concluded: false,
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
    })
    await cartRepository.create({
      contact,
      licensee,
      concluded: false,
      createdAt: new Date(Date.now() + 60 * 60 * 1000),
    })

    await cartRepository.updateMany({ concluded: false, createdAt: { $lte: new Date() } }, { concluded: true })

    expect(await cartRepository.find({ concluded: true })).toHaveLength(1)
    expect(await cartRepository.find({ createdAt: { $gt: new Date() } })).toHaveLength(1)

    await cartRepository.delete({ concluded: false })
    expect(await cartRepository.find()).toHaveLength(1)
  })

  it('creates orders and products in memory', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const orderRepository = new OrderRepositoryMemory()
    const productRepository = new ProductRepositoryMemory()

    const licensee = await licenseeRepository.create(licenseeFactory.build())
    await productRepository.create({ licensee, name: 'Product 1' })
    await orderRepository.create(orderFactory.build({ licensee, order_external_id: '9967816' }))

    expect(await productRepository.findFirst({ name: 'Product 1', licensee: licensee._id })).toEqual(
      expect.objectContaining({ name: 'Product 1' }),
    )
    expect(await orderRepository.findFirst({ order_external_id: '9967816' })).toEqual(
      expect.objectContaining({ order_external_id: '9967816' }),
    )
  })
})
