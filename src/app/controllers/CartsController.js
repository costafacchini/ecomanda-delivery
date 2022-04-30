const Cart = require('@models/Cart')
const { sanitizeModelErrors } = require('../helpers/SanitizeErrors')
const _ = require('lodash')
const Contact = require('@models/Contact')
const NormalizePhone = require('@helpers/NormalizePhone')
const { createMessage } = require('@repositories/message')
const { scheduleSendMessageToMessenger } = require('@repositories/messenger')

async function getContact(number, licenseeId) {
  const normalizedPhone = new NormalizePhone(number)
  const licensee = licenseeId
  return await Contact.findOne({
    number: normalizedPhone.number,
    licensee: licensee._id,
    type: normalizedPhone.type,
  })
}

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
  ]

  return _.pick(fields, permitedFields)
}

class CartsController {
  async create(req, res) {
    const {
      delivery_tax,
      products,
      contact,
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
    } = req.body

    try {
      const cartContact = await getContact(contact, req.licensee._id)
      if (!cartContact) {
        return res.status(404).send({ errors: { message: `Contato ${contact} não encontrado` } })
      }

      const cart = new Cart({
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
      })

      const validation = cart.validateSync()
      if (validation) {
        return res.status(422).json({ errors: sanitizeModelErrors(validation.errors) })
      } else {
        await cart.save()
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
      const contact = await getContact(req.params.contact, req.licensee._id)
      if (!contact) {
        return res.status(404).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      let cart = await Cart.findOne({
        contact: contact._id,
        concluded: false,
      })

      if (!cart) {
        return res.status(404).send({ errors: { message: `Carrinho não encontrado` } })
      }

      try {
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
      } catch (err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }

      res.status(200).send(cart)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async show(req, res) {
    try {
      const contact = await getContact(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(404).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      const cart = await Cart.findOne({
        contact: contact._id,
        concluded: false,
      })
        .populate('contact')
        .populate('licensee')

      if (!cart) {
        return res.status(404).send({ errors: { message: `Carrinho não encontrado` } })
      }

      res.status(200).send(cart)
    } catch (err) {
      return res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async close(req, res) {
    try {
      const contact = await getContact(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(404).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      let cart = await Cart.findOne({
        contact: contact._id,
        concluded: false,
      })

      if (!cart) {
        return res.status(404).send({ errors: { message: `Carrinho não encontrado` } })
      }

      try {
        await Cart.updateOne({ _id: cart._id }, { concluded: true }, { runValidators: true })
      } catch (err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }

      cart = await Cart.findOne({ _id: cart._id })

      res.status(200).send(cart)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async addItem(req, res) {
    try {
      const contact = await getContact(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(404).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      let cart = await Cart.findOne({
        contact: contact._id,
        concluded: false,
      })

      if (!cart) {
        return res.status(404).send({ errors: { message: `Carrinho não encontrado` } })
      }

      req.body.products?.forEach((product) => {
        cart.products.push(product)
      })

      try {
        await cart.save()
      } catch (err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }

      res.status(200).send(cart)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async removeItem(req, res) {
    try {
      const contact = await getContact(req.params.contact, req.licensee._id)

      if (!contact) {
        return res.status(404).send({ errors: { message: `Contato ${req.params.contact} não encontrado` } })
      }

      let cart = await Cart.findOne({
        contact: contact._id,
        concluded: false,
      })

      if (!cart) {
        return res.status(404).send({ errors: { message: `Carrinho não encontrado` } })
      }

      try {
        const item = cart.products[req.body.item - 1]
        item.remove()
        await cart.save()
      } catch (err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }

      cart = await Cart.findOne({ _id: cart._id })

      res.status(200).send(cart)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async send(req, res) {
    try {
      let cart
      try {
        cart = await Cart.findOne({ _id: req.params.cart }).populate('contact')
      } catch (err) {
        return res.status(404).send({ errors: { message: `Carrinho não encontrado` } })
      }

      const message = await createMessage({
        text: '$last_cart_resume',
        kind: 'interactive',
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
}

module.exports = CartsController
