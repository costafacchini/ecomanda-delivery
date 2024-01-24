const Cart = require('@models/Cart')
const _ = require('lodash')
const NormalizePhone = require('@helpers/NormalizePhone')
const { createTextMessageInsteadInteractive } = require('@repositories/message')
const { createContact } = require('@repositories/contact')
const { scheduleSendMessageToMessenger } = require('@repositories/messenger')
const { parseCart } = require('@helpers/ParseTriggerText')
const createCartAdapter = require('../plugins/carts/adapters/factory')
const cartFactory = require('@plugins/carts/factory')
const { publishMessage } = require('@config/rabbitmq')
const { getContactByNumber } = require('@repositories/contact')

function permit(fields) {
  const permitedFields = [
    'delivery_tax',
    'products',
    'concluded',
    'catalog',
    'address',
    'address_number',
    'address_complement',
    'neighborhood',
    'city',
    'cep',
    'uf',
    'note',
    'change',
    'partner_key',
    'payment_method',
    'points',
    'discount',
    'latitude',
    'longitude',
    'location',
    'documento',
    'delivery_method',
  ]

  return _.pick(fields, permitedFields)
}

class CartsController {
  async create(req, res) {
    let { name } = req.body
    let { contact } = req.body
    if (!contact) contact = req.query.contact

    try {
      let cartContact = await getContactByNumber(contact, req.licensee._id)
      if (!cartContact) {
        if (!name) name = contact

        const normalizedPhone = new NormalizePhone(contact)

        cartContact = await createContact({
          licensee: req.licensee._id,
          number: normalizedPhone.number,
          type: normalizedPhone.type,
          name,
          talkingWithChatBot: req.licensee.useChatbot,
        })
      }

      const cartPlugin = createCartAdapter(req.licensee)

      const {
        delivery_tax,
        products,
        concluded,
        catalog,
        address,
        address_number,
        address_complement,
        neighborhood,
        city,
        cep,
        uf,
        note,
        change,
        partner_key,
        payment_method,
        points,
        discount,
        latitude,
        longitude,
        location,
        documento,
        delivery_method,
      } = cartPlugin.parseCart(req.licensee, contact, req.body)

      let cart = await Cart.findOne({
        contact: cartContact._id,
        concluded: false,
      })

      if (!cart) {
        cart = new Cart({
          delivery_tax,
          contact: cartContact._id,
          licensee: req.licensee._id,
          products,
          concluded,
          catalog,
          address,
          address_number,
          address_complement,
          neighborhood,
          city,
          cep,
          uf,
          note,
          change,
          partner_key,
          payment_method,
          points,
          discount,
          latitude,
          longitude,
          location,
          documento,
          delivery_method,
        })
      } else {
        cart.delivery_tax = delivery_tax
        cart.catalog = catalog
        cart.address = address
        cart.address_number = address_number
        cart.address_complement = address_complement
        cart.neighborhood = neighborhood
        cart.city = city
        cart.cep = cep
        cart.uf = uf
        cart.note = note
        cart.change = change
        cart.partner_key = partner_key
        cart.payment_method = payment_method
        cart.points = points
        cart.discount = discount
        cart.latitude = latitude
        cart.longitude = longitude
        cart.location = location
        cart.documento = documento
        cart.delivery_method = delivery_method

        products.forEach((item) => {
          cart.products.push(item)
        })
      }

      await cart.save()

      res.status(201).send(cart)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async update(req, res) {
    const fields = permit(req.body)
    delete fields.licensee
    delete fields.contact

    try {
      const contact = await getContactByNumber(req.params.contact, req.licensee._id)
      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      let cart = await Cart.findOne({
        contact: contact._id,
        concluded: false,
      })

      if (!cart) {
        return res.status(200).send({ errors: { message: `Carrinho não encontrado` } })
      }

      Object.keys(fields).forEach((field) => {
        if (Array.isArray(fields[field])) {
          fields[field].forEach((item) => {
            cart[field].push(item)
          })
        } else {
          cart[field] = fields[field]
        }
      })
      await cart.save()

      res.status(200).send(cart)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async show(req, res) {
    try {
      const contact = await getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      const cart = await Cart.findOne({
        contact: contact._id,
        concluded: false,
      })

      if (!cart) {
        return res.status(200).send({ errors: { message: `Carrinho não encontrado` } })
      }

      const cartDescription = await parseCart(cart._id)

      res.status(200).send({ cart: cartDescription })
    } catch (err) {
      return res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async close(req, res) {
    try {
      const contact = await getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      let cart = await Cart.findOne({
        contact: contact._id,
        concluded: false,
      })

      if (!cart) {
        return res.status(200).send({ errors: { message: `Carrinho não encontrado` } })
      }

      await Cart.updateOne({ _id: cart._id }, { concluded: true }, { runValidators: true })

      cart = await Cart.findOne({ _id: cart._id })

      res.status(200).send(cart)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async addItem(req, res) {
    try {
      const contact = await getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      let cart = await Cart.findOne({
        contact: contact._id,
        concluded: false,
      })

      if (!cart) {
        return res.status(200).send({ errors: { message: `Carrinho não encontrado` } })
      }

      req.body.products?.forEach((product) => {
        const cartItem = cart.products.find((item) => item.product_retailer_id == product.product_retailer_id)
        if (cartItem) {
          cartItem.quantity = cartItem.quantity + product.quantity
        } else {
          cart.products.push(product)
        }
      })

      await cart.save()

      res.status(200).send(cart)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async removeItem(req, res) {
    try {
      const contact = await getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      let cart = await Cart.findOne({
        contact: contact._id,
        concluded: false,
      })

      if (!cart) {
        return res.status(200).send({ errors: { message: `Carrinho não encontrado` } })
      }

      cart.products.splice(req.body.item - 1)
      await cart.save()

      cart = await Cart.findOne({ _id: cart._id })

      res.status(200).send(cart)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async send(req, res) {
    try {
      const contact = await getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      let cart
      try {
        cart = await Cart.findOne({
          contact: contact._id,
          concluded: false,
        }).populate('contact')
      } catch (err) {
        return res.status(200).send({ errors: { message: 'Carrinho não encontrado' } })
      }

      if (!cart) {
        return res.status(200).send({ errors: { message: 'Carrinho não encontrado' } })
      }

      const cartDescription = await parseCart(cart._id)
      const message = await createTextMessageInsteadInteractive({
        text: cartDescription,
        kind: 'text',
        licensee: req.licensee._id,
        contact: cart.contact,
        destination: 'to-messenger',
      })

      await scheduleSendMessageToMessenger({
        messageId: message._id,
        url: req.licensee.whatsappUrl,
        token: req.licensee.whatsappToken,
      })

      res.status(200).send({ message: 'Carrinho agendado para envio' })
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async getCart(req, res) {
    try {
      const contact = await getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      const cart = await Cart.findOne({
        contact: contact._id,
        concluded: false,
      })

      if (!cart) {
        return res.status(200).send({ errors: { message: `Carrinho não encontrado` } })
      }

      const cartPlugin = cartFactory(req.licensee)
      const cartTransformed = await cartPlugin.transformCart(req.licensee, cart)

      res.status(200).send(cartTransformed)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async getPayment(req, res) {
    try {
      const contact = await getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      const cart = await Cart.findOne({
        contact: contact._id,
        concluded: false,
      })

      if (!cart) {
        return res.status(200).send({ errors: { message: `Carrinho não encontrado` } })
      }

      res
        .status(200)
        .send({ cart_id: cart._id, payment_status: cart.payment_status, integration_status: cart.integration_status })
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  reset(_, res) {
    console.info('Agendando para resetar carts expirando')

    publishMessage({ key: 'reset-carts', body: {} })

    res.status(200).send({ body: 'Solicitação para avisar os carts com janela vencendo agendado com sucesso' })
  }
}

module.exports = CartsController
