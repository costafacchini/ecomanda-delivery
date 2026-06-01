import { ContactRepositoryMemory } from '@repositories/contact'
import { CartRepositoryMemory } from '@repositories/cart'
import { MessageRepositoryMemory } from '@repositories/message'
import { SendCart } from './SendCart'
import { CART_NOT_FOUND } from './cartErrors'

function buildUseCase() {
  const contactRepository = new ContactRepositoryMemory()
  const cartRepository = new CartRepositoryMemory()
  const messageRepository = new MessageRepositoryMemory()
  const parseCart = jest.fn()
  const scheduleSendMessageToMessenger = jest.fn()

  cartRepository.relationLoaders = {
    contact: async (value) => {
      const id = value?._id ?? value
      return await contactRepository.findFirst({ _id: id })
    },
  }

  const sendCart = new SendCart({
    contactRepository,
    cartRepository,
    messageRepository,
    parseCart,
    scheduleSendMessageToMessenger,
  })

  return { sendCart, contactRepository, cartRepository, messageRepository, parseCart, scheduleSendMessageToMessenger }
}

describe('SendCart', () => {
  it('creates message and calls scheduleSendMessageToMessenger with correct args, returns undefined', async () => {
    const {
      sendCart,
      contactRepository,
      cartRepository,
      messageRepository,
      parseCart,
      scheduleSendMessageToMessenger,
    } = buildUseCase()

    const contact = await contactRepository.create({
      number: '5511990283745',
      licensee: 'licensee-id',
      type: '@c.us',
    })
    await cartRepository.create({ contact: contact._id, licensee: 'licensee-id', concluded: false })

    parseCart.mockResolvedValue('cart text')
    scheduleSendMessageToMessenger.mockResolvedValue()

    const result = await sendCart.execute({
      contactNumber: '5511990283745',
      licenseeId: 'licensee-id',
      whatsappUrl: 'https://url',
      whatsappToken: 'token',
    })

    expect(result).toBeUndefined()

    const messages = await messageRepository.find({})
    expect(messages.length).toBeGreaterThan(0)
    expect(messages[0].destination).toBe('to-messenger')

    expect(scheduleSendMessageToMessenger).toHaveBeenCalledWith(
      expect.objectContaining({
        licenseeId: 'licensee-id',
        url: 'https://url',
        token: 'token',
      }),
    )
  })

  it('returns null when contact is not found', async () => {
    const { sendCart } = buildUseCase()

    const result = await sendCart.execute({
      contactNumber: '5511111111111',
      licenseeId: 'licensee-id',
      whatsappUrl: 'https://url',
      whatsappToken: 'token',
    })

    expect(result).toBeNull()
  })

  it('returns CART_NOT_FOUND when contact exists but has no open cart', async () => {
    const { sendCart, contactRepository } = buildUseCase()

    await contactRepository.create({ number: '5511990283745', licensee: 'licensee-id', type: '@c.us' })

    const result = await sendCart.execute({
      contactNumber: '5511990283745',
      licenseeId: 'licensee-id',
      whatsappUrl: 'https://url',
      whatsappToken: 'token',
    })

    expect(result).toBe(CART_NOT_FOUND)
  })
})
