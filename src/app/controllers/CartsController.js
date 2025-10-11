import _ from 'lodash'
import NormalizePhone from '@helpers/NormalizePhone'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { scheduleSendMessageToMessenger } from '@repositories/messenger'
import { parseCart } from '@helpers/ParseTriggerText'
import createCartAdapter from '../plugins/carts/adapters/factory'
import cartFactory from '@plugins/carts/factory'
import { publishMessage } from '@config/rabbitmq'
import { CartRepositoryDatabase } from '@repositories/cart'
import { MessageRepositoryDatabase } from '@repositories/message'

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
    if (!name) name = req.query.name

    try {
      const contactRepository = new ContactRepositoryDatabase()
      let cartContact = await contactRepository.getContactByNumber(contact, req.licensee._id)
      if (!cartContact) {
        if (!name) name = contact

        const normalizedPhone = new NormalizePhone(contact)

        cartContact = await contactRepository.create({
          licensee: req.licensee._id,
          number: normalizedPhone.number,
          type: normalizedPhone.type,
          name,
          talkingWithChatBot: req.licensee.useChatbot,
        })
      }

      const plugin = req.query.origin
      const cartPlugin = createCartAdapter(plugin)

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

      const cartRepository = new CartRepositoryDatabase()
      let cart = await cartRepository.findFirst({ contact: cartContact._id, concluded: false })

      if (!cart) {
        cart = await cartRepository.create({
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
        Array.prototype.push.apply(cart.products, products)
        cart.total = cart.calculateTotal()

        await cartRepository.update(cart._id, { ...cart })
      }

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
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.getContactByNumber(req.params.contact, req.licensee._id)
      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      const cartRepository = new CartRepositoryDatabase()
      let cart = await cartRepository.findFirst({ contact: contact._id, concluded: false })

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
      cart.total = cart.calculateTotal()

      await cartRepository.update(cart._id, { ...cart })

      res.status(200).send(cart)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async show(req, res) {
    try {
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      const cartRepository = new CartRepositoryDatabase()
      let cart = await cartRepository.findFirst({ contact: contact._id, concluded: false })

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
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      const cartRepository = new CartRepositoryDatabase()
      let cart = await cartRepository.findFirst({ contact: contact._id, concluded: false })

      if (!cart) {
        return res.status(200).send({ errors: { message: `Carrinho não encontrado` } })
      }

      await cartRepository.update(cart._id, { concluded: true })

      cart = await cartRepository.findFirst({ _id: cart._id })

      res.status(200).send(cart)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async addItem(req, res) {
    try {
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      const cartRepository = new CartRepositoryDatabase()
      let cart = await cartRepository.findFirst({ contact: contact._id, concluded: false })

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
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      const cartRepository = new CartRepositoryDatabase()
      let cart = await cartRepository.findFirst({ contact: contact._id, concluded: false })

      if (!cart) {
        return res.status(200).send({ errors: { message: `Carrinho não encontrado` } })
      }

      cart.products.splice(req.body.item - 1)
      await cart.save()

      cart = await cartRepository.findFirst({ _id: cart._id })

      res.status(200).send(cart)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async send(req, res) {
    try {
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      let cart
      try {
        const cartRepository = new CartRepositoryDatabase()
        cart = await cartRepository.findFirst(
          {
            contact: contact._id,
            concluded: false,
          },
          ['contact'],
        )
      } catch {
        return res.status(200).send({ errors: { message: 'Carrinho não encontrado' } })
      }

      if (!cart) {
        return res.status(200).send({ errors: { message: 'Carrinho não encontrado' } })
      }

      const cartDescription = await parseCart(cart._id)
      const messageRepository = new MessageRepositoryDatabase()
      const message = await messageRepository.createTextMessageInsteadInteractive({
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
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      const cartRepository = new CartRepositoryDatabase()
      const cart = await cartRepository.findFirst({ contact: contact._id, concluded: false })

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
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.getContactByNumber(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(422).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      const cartRepository = new CartRepositoryDatabase()
      const cart = await cartRepository.findFirst({ contact: contact._id, concluded: false })

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

export default CartsController
