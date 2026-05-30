import { CART_NOT_FOUND } from '../usecases/carts/cartErrors.js'
import { logger } from '../helpers/logger'

class CartsController {
  constructor({
    contactRepository,
    cartRepository,
    parseCart: parseCartDependency,
    createCartPlugin: createCartPluginDependency,
    publishMessage: publishMessageDependency,
    createCart: createCartUseCase,
    updateCart: updateCartUseCase,
    addCartItem: addCartItemUseCase,
    sendCart: sendCartUseCase,
  } = {}) {
    this.contactRepository = contactRepository
    this.cartRepository = cartRepository
    this.parseCart = parseCartDependency
    this.createCartPlugin = createCartPluginDependency
    this.publishMessage = publishMessageDependency
    this.createCart = createCartUseCase
    this.updateCart = updateCartUseCase
    this.addCartItem = addCartItemUseCase
    this.sendCart = sendCartUseCase

    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.show = this.show.bind(this)
    this.close = this.close.bind(this)
    this.addItem = this.addItem.bind(this)
    this.removeItem = this.removeItem.bind(this)
    this.send = this.send.bind(this)
    this.getCart = this.getCart.bind(this)
    this.getPayment = this.getPayment.bind(this)
    this.reset = this.reset.bind(this)
  }

  async create(req, res) {
    let { name } = req.body
    let { contact } = req.body
    if (!contact) contact = req.query.contact
    if (!name) name = req.query.name

    try {
      const result = await this.createCart.execute({
        contact,
        name,
        licensee: req.licensee,
        origin: req.query.origin,
        body: req.body,
      })
      res.status(201).send(result)
    } catch (err) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async update(req, res) {
    try {
      const result = await this.updateCart.execute({
        contactNumber: req.params.contact,
        licenseeId: req.licensee._id,
        fields: req.body,
      })

      if (result === null) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      if (result === CART_NOT_FOUND) {
        return res.status(200).send({ errors: { message: 'Carrinho não encontrado' } })
      }

      res.status(200).send(result)
    } catch (err) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async show(req, res) {
    try {
      const contact = await this.contactRepository.getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      const cart = await this.cartRepository.findFirst({ contact: contact._id, concluded: false })

      if (!cart) {
        return res.status(200).send({ errors: { message: `Carrinho não encontrado` } })
      }

      const cartDescription = await this.parseCart(cart._id)

      res.status(200).send({ cart: cartDescription })
    } catch (err) {
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async close(req, res) {
    try {
      const contact = await this.contactRepository.getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      let cart = await this.cartRepository.findFirst({ contact: contact._id, concluded: false })

      if (!cart) {
        return res.status(200).send({ errors: { message: `Carrinho não encontrado` } })
      }

      await this.cartRepository.update(cart._id, { concluded: true })

      cart = await this.cartRepository.findFirst({ _id: cart._id })

      res.status(200).send(cart)
    } catch (err) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async addItem(req, res) {
    try {
      const result = await this.addCartItem.execute({
        contactNumber: req.params.contact,
        licenseeId: req.licensee._id,
        products: req.body.products,
      })

      if (result === null) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      if (result === CART_NOT_FOUND) {
        return res.status(200).send({ errors: { message: 'Carrinho não encontrado' } })
      }

      res.status(200).send(result)
    } catch (err) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async removeItem(req, res) {
    try {
      const contact = await this.contactRepository.getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      let cart = await this.cartRepository.findFirst({ contact: contact._id, concluded: false })

      if (!cart) {
        return res.status(200).send({ errors: { message: `Carrinho não encontrado` } })
      }

      cart.products.splice(req.body.item - 1)
      await this.cartRepository.save(cart)

      cart = await this.cartRepository.findFirst({ _id: cart._id })

      res.status(200).send(cart)
    } catch (err) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async send(req, res) {
    try {
      const result = await this.sendCart.execute({
        contactNumber: req.params.contact,
        licenseeId: req.licensee._id,
        whatsappUrl: req.licensee.whatsappUrl,
        whatsappToken: req.licensee.whatsappToken,
      })

      if (result === null) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      if (result === CART_NOT_FOUND) {
        return res.status(200).send({ errors: { message: 'Carrinho não encontrado' } })
      }

      res.status(200).send({ message: 'Carrinho agendado para envio' })
    } catch (err) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async getCart(req, res) {
    try {
      const contact = await this.contactRepository.getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      const cart = await this.cartRepository.findFirst({ contact: contact._id, concluded: false })

      if (!cart) {
        return res.status(200).send({ errors: { message: `Carrinho não encontrado` } })
      }

      const cartPlugin = this.createCartPlugin(req.licensee)
      const cartTransformed = await cartPlugin.transformCart(req.licensee, cart)

      res.status(200).send(cartTransformed)
    } catch (err) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async getPayment(req, res) {
    try {
      const contact = await this.contactRepository.getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      const cart = await this.cartRepository.findFirst({ contact: contact._id, concluded: false })

      if (!cart) {
        return res.status(200).send({ errors: { message: `Carrinho não encontrado` } })
      }

      res
        .status(200)
        .send({ cart_id: cart._id, payment_status: cart.payment_status, integration_status: cart.integration_status })
    } catch (err) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  reset(_, res) {
    logger.info('Agendando para resetar carts expirando')

    this.publishMessage({ key: 'reset-carts', body: {} })

    res.status(200).send({ body: 'Solicitação para avisar os carts com janela vencendo agendado com sucesso' })
  }
}

export { CartsController }
