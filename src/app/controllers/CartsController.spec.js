import { ContactRepositoryMemory } from '@repositories/contact'
import { CartRepositoryMemory } from '@repositories/cart'
import { MessageRepositoryMemory } from '@repositories/message'
import { CartsController } from './CartsController.js'

function buildResponse() {
  return {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildRepositories() {
  const contactRepository = new ContactRepositoryMemory()
  const cartRepository = new CartRepositoryMemory()
  const messageRepository = new MessageRepositoryMemory()

  cartRepository.relationLoaders = {
    contact: async (value) => {
      const id = value?._id ?? value
      return await contactRepository.findFirst({ _id: id })
    },
  }

  return { contactRepository, cartRepository, messageRepository }
}

function buildController(overrides = {}) {
  const { contactRepository, cartRepository, messageRepository } = buildRepositories()
  const cartAdapterInstance = { parseCart: jest.fn() }
  const createCartAdapter = jest.fn().mockReturnValue(cartAdapterInstance)
  const cartPluginInstance = { transformCart: jest.fn() }
  const createCartPlugin = jest.fn().mockReturnValue(cartPluginInstance)
  const parseCart = jest.fn()
  const createNormalizePhone = jest.fn()
  const scheduleSendMessageToMessenger = jest.fn()
  const publishMessage = jest.fn()

  const controller = new CartsController({
    contactRepository: overrides.contactRepository ?? contactRepository,
    cartRepository: overrides.cartRepository ?? cartRepository,
    messageRepository: overrides.messageRepository ?? messageRepository,
    createNormalizePhone,
    parseCart,
    createCartAdapter,
    createCartPlugin,
    scheduleSendMessageToMessenger,
    publishMessage,
  })

  return {
    controller,
    contactRepository: overrides.contactRepository ?? contactRepository,
    cartRepository: overrides.cartRepository ?? cartRepository,
    messageRepository: overrides.messageRepository ?? messageRepository,
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
      const { controller, contactRepository, cartAdapterInstance } = buildController()
      await contactRepository.create({ number: '5511990283745', licensee: 'licensee-id', type: '@c.us' })

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

      expect(res.status).toHaveBeenCalledWith(201)
    })

    it('returns 500 when an unexpected error occurs', async () => {
      const contactRepository = { getContactByNumber: jest.fn().mockRejectedValue(new Error('some error')) }
      const { controller } = buildController({ contactRepository })

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
      const { controller } = buildController()

      const req = { params: { contact: '551164646464' }, body: {}, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Contato 551164646464 não encontrado' } })
    })

    it('returns 200 with not-found message when cart does not exist', async () => {
      const { controller, contactRepository } = buildController()
      await contactRepository.create({ number: '5511990283745', licensee: 'licensee-id', type: '@c.us' })

      const req = { params: { contact: '5511990283745' }, body: {}, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Carrinho não encontrado' } })
    })

    it('returns 500 when an unexpected error occurs', async () => {
      const contactRepository = { getContactByNumber: jest.fn().mockRejectedValue(new Error('some error')) }
      const { controller } = buildController({ contactRepository })

      const req = { params: { contact: '5511990283745' }, body: {}, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Error: some error' } })
    })
  })

  describe('show', () => {
    it('returns 422 when contact is not found', async () => {
      const { controller } = buildController()

      const req = { params: { contact: '551164646464' }, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Contato 551164646464 não encontrado' } })
    })

    it('returns 200 with cart description when cart exists', async () => {
      const { controller, contactRepository, cartRepository, parseCart } = buildController()
      const contact = await contactRepository.create({
        number: '5511990283745',
        licensee: 'licensee-id',
        type: '@c.us',
      })
      await cartRepository.create({ contact: contact._id, concluded: false, licensee: 'licensee-id' })
      parseCart.mockResolvedValue('cart description text')

      const req = { params: { contact: '5511990283745' }, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({ cart: 'cart description text' })
    })
  })

  describe('close', () => {
    it('closes the cart and returns status 200', async () => {
      const { controller, contactRepository, cartRepository } = buildController()
      const contact = await contactRepository.create({
        number: '5511990283745',
        licensee: 'licensee-id',
        type: '@c.us',
      })
      await cartRepository.create({ contact: contact._id, concluded: false, licensee: 'licensee-id' })

      const req = { params: { contact: '5511990283745' }, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.close(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ concluded: true }))
    })

    it('returns 200 with not-found message when cart does not exist', async () => {
      const { controller, contactRepository } = buildController()
      await contactRepository.create({ number: '5511990283745', licensee: 'licensee-id', type: '@c.us' })

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
      const contact = await contactRepository.create({
        number: '5511990283745',
        licensee: 'licensee-id',
        type: '@c.us',
      })
      await cartRepository.create({ contact: contact._id, concluded: false, licensee: 'licensee-id' })
      parseCart.mockResolvedValue('cart text')
      scheduleSendMessageToMessenger.mockResolvedValue()

      const req = {
        params: { contact: '5511990283745' },
        licensee: { _id: 'licensee-id', whatsappUrl: 'https://url', whatsappToken: 'token' },
      }
      const res = buildResponse()

      await controller.send(req, res)

      const messages = await messageRepository.find({})
      expect(messages.length).toBeGreaterThan(0)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({ message: 'Carrinho agendado para envio' })
    })
  })

  describe('getPayment', () => {
    it('returns payment status and cart id when cart exists', async () => {
      const { controller, contactRepository, cartRepository } = buildController()
      const contact = await contactRepository.create({
        number: '5511990283745',
        licensee: 'licensee-id',
        type: '@c.us',
      })
      const cart = await cartRepository.create({
        contact: contact._id,
        concluded: false,
        licensee: 'licensee-id',
        payment_status: 'waiting',
        integration_status: 'pending',
      })

      const req = { params: { contact: '5511990283745' }, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.getPayment(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({
        cart_id: cart._id,
        payment_status: 'waiting',
        integration_status: 'pending',
      })
    })
  })
})
