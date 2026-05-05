import { CART_NOT_FOUND } from './cartErrors.js'

class SendCart {
  constructor({
    contactRepository,
    cartRepository,
    messageRepository,
    parseCart,
    scheduleSendMessageToMessenger,
  } = {}) {
    this.contactRepository = contactRepository
    this.cartRepository = cartRepository
    this.messageRepository = messageRepository
    this.parseCart = parseCart
    this.scheduleSendMessageToMessenger = scheduleSendMessageToMessenger
  }

  async execute({ contactNumber, licenseeId, whatsappUrl, whatsappToken } = {}) {
    const contact = await this.contactRepository.getContactByNumber(contactNumber, licenseeId)
    if (!contact) return null

    const cart = await this.cartRepository.findFirst({ contact: contact._id, concluded: false }, ['contact'])
    if (!cart) return CART_NOT_FOUND

    const cartDescription = await this.parseCart(cart._id)

    const message = await this.messageRepository.createTextMessageInsteadInteractive({
      text: cartDescription,
      kind: 'text',
      licensee: licenseeId,
      contact: cart.contact,
      destination: 'to-messenger',
    })

    await this.scheduleSendMessageToMessenger({
      messageId: message._id,
      contactId: cart.contact._id,
      licenseeId,
      url: whatsappUrl,
      token: whatsappToken,
    })
  }
}

export { SendCart }
