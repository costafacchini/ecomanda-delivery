import { CartsController } from './CartsController.js'

function buildResponse() {
  return {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildController() {
  const contactRepository = {
    getContactByNumber: jest.fn(),
    create: jest.fn(),
  }
  const cartRepository = {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }
  const messageRepository = {
    createTextMessageInsteadInteractive: jest.fn(),
  }
  const cartAdapterInstance = { parseCart: jest.fn() }
  const createCartAdapter = jest.fn().mockReturnValue(cartAdapterInstance)
  const cartPluginInstance = { transformCart: jest.fn() }
  const createCartPlugin = jest.fn().mockReturnValue(cartPluginInstance)
  const parseCart = jest.fn()
  const createNormalizePhone = jest.fn()
  const scheduleSendMessageToMessenger = jest.fn()
  const publishMessage = jest.fn()

  const controller = new CartsController({
    contactRepository,
    cartRepository,
    messageRepository,
    createNormalizePhone,
    parseCart,
    createCartAdapter,
    createCartPlugin,
    scheduleSendMessageToMessenger,
    publishMessage,
  })

  return {
    controller,
    contactRepository,
    cartRepository,
    messageRepository,
    cartAdapterInstance,
    createCartAdapter,
    cartPluginInstance,
    createCartPlugin,
    parseCart,
    createNormalizePhone,
    scheduleSendMessageToMessenger,
    publishMessage,
  }
}

describe('CartsController delegation', () => {
  describe('create', () => {
    it('creates a new cart and returns status 201', async () => {
      const { controller, contactRepository, cartRepository, cartAdapterInstance } = buildController()
      const contact = { _id: 'contact-id', number: '5511990283745' }
      const cart = { _id: 'cart-id', total: 16.1, concluded: false }

      contactRepository.getContactByNumber.mockResolvedValue(contact)
      cartRepository.findFirst.mockResolvedValue(null)
      cartRepository.create.mockResolvedValue(cart)
      cartAdapterInstance.parseCart.mockReturnValue({
        products: [],
        delivery_tax: 0.5,
        concluded: false,
        catalog: null,
        address: '',
        address_number: '',
        address_complement: '',
        neighborhood: '',
        city: '',
        cep: '',
        uf: '',
        note: '',
        change: 0,
        partner_key: '',
        payment_method: '',
        points: 0,
        discount: 0,
        latitude: null,
        longitude: null,
        location: null,
        documento: '',
        delivery_method: '',
      })

      const req = {
        body: { contact: '5511990283745' },
        query: {},
        licensee: { _id: 'licensee-id', useChatbot: false },
      }
      const res = buildResponse()

      await controller.create(req, res)

      expect(contactRepository.getContactByNumber).toHaveBeenCalledWith('5511990283745', 'licensee-id')
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.send).toHaveBeenCalledWith(cart)
    })

    it('returns 500 when an unexpected error occurs', async () => {
      const { controller, contactRepository } = buildController()
      contactRepository.getContactByNumber.mockRejectedValue(new Error('some error'))

      const req = {
        body: { contact: '5511990283745' },
        query: {},
        licensee: { _id: 'licensee-id' },
      }
      const res = buildResponse()

      await controller.create(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Error: some error' } })
    })
  })

  describe('update', () => {
    it('returns 422 when contact is not found', async () => {
      const { controller, contactRepository } = buildController()
      contactRepository.getContactByNumber.mockResolvedValue(null)

      const req = { params: { contact: '551164646464' }, body: {}, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Contato 551164646464 não encontrado' } })
    })

    it('returns 200 with not-found message when cart does not exist', async () => {
      const { controller, contactRepository, cartRepository } = buildController()
      contactRepository.getContactByNumber.mockResolvedValue({ _id: 'contact-id' })
      cartRepository.findFirst.mockResolvedValue(null)

      const req = { params: { contact: '5511990283745' }, body: {}, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Carrinho não encontrado' } })
    })

    it('returns 500 when an unexpected error occurs', async () => {
      const { controller, contactRepository } = buildController()
      contactRepository.getContactByNumber.mockRejectedValue(new Error('some error'))

      const req = { params: { contact: '5511990283745' }, body: {}, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Error: some error' } })
    })
  })

  describe('show', () => {
    it('returns 422 when contact is not found', async () => {
      const { controller, contactRepository } = buildController()
      contactRepository.getContactByNumber.mockResolvedValue(null)

      const req = { params: { contact: '551164646464' }, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Contato 551164646464 não encontrado' } })
    })

    it('returns 200 with cart description when cart exists', async () => {
      const { controller, contactRepository, cartRepository, parseCart } = buildController()
      const contact = { _id: 'contact-id' }
      const cart = { _id: 'cart-id' }
      contactRepository.getContactByNumber.mockResolvedValue(contact)
      cartRepository.findFirst.mockResolvedValue(cart)
      parseCart.mockResolvedValue('cart description text')

      const req = { params: { contact: '5511990283745' }, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(parseCart).toHaveBeenCalledWith('cart-id')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({ cart: 'cart description text' })
    })
  })

  describe('close', () => {
    it('closes the cart and returns status 200', async () => {
      const { controller, contactRepository, cartRepository } = buildController()
      const contact = { _id: 'contact-id' }
      const cart = { _id: 'cart-id' }
      const closedCart = { _id: 'cart-id', concluded: true }
      contactRepository.getContactByNumber.mockResolvedValue(contact)
      cartRepository.findFirst.mockResolvedValueOnce(cart).mockResolvedValueOnce(closedCart)
      cartRepository.update.mockResolvedValue()

      const req = { params: { contact: '5511990283745' }, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.close(req, res)

      expect(cartRepository.update).toHaveBeenCalledWith('cart-id', { concluded: true })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(closedCart)
    })

    it('returns 200 with not-found message when cart does not exist', async () => {
      const { controller, contactRepository, cartRepository } = buildController()
      contactRepository.getContactByNumber.mockResolvedValue({ _id: 'contact-id' })
      cartRepository.findFirst.mockResolvedValue(null)

      const req = { params: { contact: '5511990283745' }, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.close(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Carrinho não encontrado' } })
    })
  })

  describe('reset', () => {
    it('publishes reset-carts and returns status 200', () => {
      const { controller, publishMessage } = buildController()
      const req = {}
      const res = buildResponse()

      jest.spyOn(global.console, 'info').mockImplementation()

      controller.reset(req, res)

      expect(publishMessage).toHaveBeenCalledWith({ key: 'reset-carts', body: {} })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({
        body: 'Solicitação para avisar os carts com janela vencendo agendado com sucesso',
      })
    })
  })

  describe('send', () => {
    it('schedules cart for send and returns status 200', async () => {
      const {
        controller,
        contactRepository,
        cartRepository,
        messageRepository,
        parseCart,
        scheduleSendMessageToMessenger,
      } = buildController()
      const contact = { _id: 'contact-id', number: '5511990283745' }
      const cart = { _id: 'cart-id', contact }
      contactRepository.getContactByNumber.mockResolvedValue(contact)
      cartRepository.findFirst.mockResolvedValue(cart)
      parseCart.mockResolvedValue('cart text')
      messageRepository.createTextMessageInsteadInteractive.mockResolvedValue({ _id: 'message-id' })
      scheduleSendMessageToMessenger.mockResolvedValue()

      const req = {
        params: { contact: '5511990283745' },
        licensee: { _id: 'licensee-id', whatsappUrl: 'https://url', whatsappToken: 'token' },
      }
      const res = buildResponse()

      await controller.send(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({ message: 'Carrinho agendado para envio' })
    })
  })

  describe('getPayment', () => {
    it('returns payment status and cart id when cart exists', async () => {
      const { controller, contactRepository, cartRepository } = buildController()
      const contact = { _id: 'contact-id' }
      const cart = { _id: 'cart-id', payment_status: 'waiting', integration_status: 'pending' }
      contactRepository.getContactByNumber.mockResolvedValue(contact)
      cartRepository.findFirst.mockResolvedValue(cart)

      const req = { params: { contact: '5511990283745' }, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.getPayment(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({
        cart_id: 'cart-id',
        payment_status: 'waiting',
        integration_status: 'pending',
      })
    })
  })
})
