import { ContactRepositoryMemory } from '@repositories/contact'
import { CartRepositoryMemory } from '@repositories/cart'
import { CartsController } from './CartsController.js'
import { CART_NOT_FOUND } from '../usecases/carts/cartErrors.js'

jest.mock('../helpers/logger.js', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}))

function buildResponse() {
  return {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildRepositories() {
  const contactRepository = new ContactRepositoryMemory()
  const cartRepository = new CartRepositoryMemory()

  return { contactRepository, cartRepository }
}

function buildController(overrides = {}) {
  const { contactRepository, cartRepository } = buildRepositories()
  const cartPluginInstance = { transformCart: jest.fn() }
  const createCartPlugin = jest.fn().mockReturnValue(cartPluginInstance)
  const parseCart = jest.fn()
  const publishMessage = jest.fn()

  const createCart = { execute: jest.fn() }
  const updateCart = { execute: jest.fn() }
  const addCartItem = { execute: jest.fn() }
  const sendCart = { execute: jest.fn() }

  const controller = new CartsController({
    contactRepository: overrides.contactRepository ?? contactRepository,
    cartRepository: overrides.cartRepository ?? cartRepository,
    parseCart,
    createCartPlugin,
    publishMessage,
    createCart,
    updateCart,
    addCartItem,
    sendCart,
  })

  return {
    controller,
    contactRepository: overrides.contactRepository ?? contactRepository,
    cartRepository: overrides.cartRepository ?? cartRepository,
    cartPluginInstance,
    createCartPlugin,
    parseCart,
    publishMessage,
    createCart,
    updateCart,
    addCartItem,
    sendCart,
  }
}

describe('CartsController delegation', () => {
  describe('create', () => {
    it('delegates to createCart use case and returns status 201', async () => {
      const { controller, createCart, cartRepository, contactRepository } = buildController()

      const contact = await contactRepository.create({
        number: '5511990283745',
        licensee: 'licensee-id',
        type: '@c.us',
      })
      const cart = await cartRepository.create({ contact: contact._id, licensee: 'licensee-id', concluded: false })

      createCart.execute.mockResolvedValue(cart)

      const req = {
        body: { contact: '5511990283745' },
        query: {},
        licensee: { _id: 'licensee-id', useChatbot: false },
      }
      const res = buildResponse()

      await controller.create(req, res)

      expect(createCart.execute).toHaveBeenCalledWith({
        contact: '5511990283745',
        name: undefined,
        licensee: req.licensee,
        origin: undefined,
        body: req.body,
      })
      expect(res.status).toHaveBeenCalledWith(201)
    })

    it('returns 500 when an unexpected error occurs', async () => {
      const { controller, createCart } = buildController()

      createCart.execute.mockRejectedValue(new Error('some error'))

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
    it('returns 422 when contact is not found (use case returns null)', async () => {
      const { controller, updateCart } = buildController()

      updateCart.execute.mockResolvedValue(null)

      const req = { params: { contact: '551164646464' }, body: {}, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Contato 551164646464 não encontrado' } })
    })

    it('returns 200 with not-found message when use case returns CART_NOT_FOUND', async () => {
      const { controller, updateCart } = buildController()

      updateCart.execute.mockResolvedValue(CART_NOT_FOUND)

      const req = { params: { contact: '5511990283745' }, body: {}, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Carrinho não encontrado' } })
    })

    it('returns 200 with cart when use case succeeds', async () => {
      const { controller, updateCart, cartRepository, contactRepository } = buildController()

      const contact = await contactRepository.create({
        number: '5511990283745',
        licensee: 'licensee-id',
        type: '@c.us',
      })
      const cart = await cartRepository.create({ contact: contact._id, licensee: 'licensee-id', concluded: false })

      updateCart.execute.mockResolvedValue(cart)

      const req = { params: { contact: '5511990283745' }, body: { note: 'test' }, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(cart)
    })

    it('returns 500 when an unexpected error occurs', async () => {
      const { controller, updateCart } = buildController()

      updateCart.execute.mockRejectedValue(new Error('some error'))

      const req = { params: { contact: '5511990283745' }, body: {}, licensee: { _id: 'licensee-id' } }
      const res = buildResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Error: some error' } })
    })
  })

  describe('addItem', () => {
    it('returns 422 when contact is not found (use case returns null)', async () => {
      const { controller, addCartItem } = buildController()

      addCartItem.execute.mockResolvedValue(null)

      const req = {
        params: { contact: '551164646464' },
        body: { products: [] },
        licensee: { _id: 'licensee-id' },
      }
      const res = buildResponse()

      await controller.addItem(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Contato 551164646464 não encontrado' } })
    })

    it('returns 200 with not-found message when use case returns CART_NOT_FOUND', async () => {
      const { controller, addCartItem } = buildController()

      addCartItem.execute.mockResolvedValue(CART_NOT_FOUND)

      const req = {
        params: { contact: '5511990283745' },
        body: { products: [] },
        licensee: { _id: 'licensee-id' },
      }
      const res = buildResponse()

      await controller.addItem(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Carrinho não encontrado' } })
    })

    it('returns 200 with cart when use case succeeds', async () => {
      const { controller, addCartItem, cartRepository, contactRepository } = buildController()

      const contact = await contactRepository.create({
        number: '5511990283745',
        licensee: 'licensee-id',
        type: '@c.us',
      })
      const cart = await cartRepository.create({ contact: contact._id, licensee: 'licensee-id', concluded: false })

      addCartItem.execute.mockResolvedValue(cart)

      const req = {
        params: { contact: '5511990283745' },
        body: { products: [] },
        licensee: { _id: 'licensee-id' },
      }
      const res = buildResponse()

      await controller.addItem(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(cart)
    })

    it('returns 500 when an unexpected error occurs', async () => {
      const { controller, addCartItem } = buildController()

      addCartItem.execute.mockRejectedValue(new Error('some error'))

      const req = {
        params: { contact: '5511990283745' },
        body: { products: [] },
        licensee: { _id: 'licensee-id' },
      }
      const res = buildResponse()

      await controller.addItem(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Error: some error' } })
    })
  })

  describe('send', () => {
    it('returns 200 with scheduled message when use case succeeds (returns undefined)', async () => {
      const { controller, sendCart } = buildController()

      sendCart.execute.mockResolvedValue(undefined)

      const req = {
        params: { contact: '5511990283745' },
        licensee: { _id: 'licensee-id', whatsappUrl: 'https://url', whatsappToken: 'token' },
      }
      const res = buildResponse()

      await controller.send(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({ message: 'Carrinho agendado para envio' })
    })

    it('returns 422 when contact is not found (use case returns null)', async () => {
      const { controller, sendCart } = buildController()

      sendCart.execute.mockResolvedValue(null)

      const req = {
        params: { contact: '551164646464' },
        licensee: { _id: 'licensee-id', whatsappUrl: 'https://url', whatsappToken: 'token' },
      }
      const res = buildResponse()

      await controller.send(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Contato 551164646464 não encontrado' } })
    })

    it('returns 200 with not-found message when use case returns CART_NOT_FOUND', async () => {
      const { controller, sendCart } = buildController()

      sendCart.execute.mockResolvedValue(CART_NOT_FOUND)

      const req = {
        params: { contact: '5511990283745' },
        licensee: { _id: 'licensee-id', whatsappUrl: 'https://url', whatsappToken: 'token' },
      }
      const res = buildResponse()

      await controller.send(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Carrinho não encontrado' } })
    })

    it('returns 500 when an unexpected error occurs', async () => {
      const { controller, sendCart } = buildController()

      sendCart.execute.mockRejectedValue(new Error('some error'))

      const req = {
        params: { contact: '5511990283745' },
        licensee: { _id: 'licensee-id', whatsappUrl: 'https://url', whatsappToken: 'token' },
      }
      const res = buildResponse()

      await controller.send(req, res)

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

      controller.reset(req, res)

      expect(publishMessage).toHaveBeenCalledWith({ key: 'reset-carts', body: {} })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({
        body: 'Solicitação para avisar os carts com janela vencendo agendado com sucesso',
      })
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
