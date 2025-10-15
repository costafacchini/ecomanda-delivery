import { ContactRepositoryDatabase } from '../repositories/contact.js'
import { check, validationResult } from 'express-validator'
import { sanitizeExpressErrors, sanitizeModelErrors } from '../helpers/SanitizeErrors.js'
import _ from 'lodash'
import { ContactsQuery } from '../queries/ContactsQuery.js'
import { queueServer } from '../../config/queue.js'

function permit(fields) {
  const permitedFields = [
    'name',
    'number',
    'type',
    'talkingWithChatBot',
    'licensee',
    'waId',
    'landbotId',
    'email',
    'address',
    'address_number',
    'address_complement',
    'neighborhood',
    'city',
    'cep',
    'uf',
    'delivery_tax',
    'plugin_cart_id',
  ]

  return _.pick(fields, permitedFields)
}

class ContactsController {
  validations() {
    return [
      check('email', 'Email deve ser preenchido com um valor válido')
        .optional({ checkFalsy: true })
        .isEmail()
        .normalizeEmail(),
    ]
  }

  async create(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: sanitizeExpressErrors(errors.array()) })
    }

    const {
      name,
      number,
      type,
      talkingWithChatBot,
      licensee,
      waId,
      landbotId,
      email,
      address,
      address_number,
      address_complement,
      neighborhood,
      city,
      cep,
      uf,
      delivery_tax,
      plugin_cart_id,
    } = req.body

    try {
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create({
        name,
        number,
        type,
        talkingWithChatBot,
        licensee,
        waId,
        landbotId,
        email,
        address,
        address_number,
        address_complement,
        neighborhood,
        city,
        cep,
        uf,
        delivery_tax,
        plugin_cart_id,
      })

      await queueServer.addJob('send-contact-to-pagarme', { contactId: contact._id.toString() })

      res.status(201).send(contact)
    } catch (err) {
      if ('errors' in err) {
        return res.status(422).send({ errors: sanitizeModelErrors(err.errors) })
      }
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async update(req, res) {
    const fields = permit(req.body)
    delete fields.licensee

    const contactRepository = new ContactRepositoryDatabase()
    try {
      await contactRepository.update(req.params.id, { ...fields })
    } catch (err) {
      return res.status(422).send({ errors: sanitizeModelErrors(err.errors) })
    }

    try {
      const contact = await contactRepository.findFirst({ _id: req.params.id })

      await queueServer.addJob('send-contact-to-pagarme', { contactId: contact._id.toString() })

      res.status(200).send(contact)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async show(req, res) {
    try {
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.findFirst({ _id: req.params.id }, ['licensee'])

      res.status(200).send(contact)
    } catch (err) {
      if (err.toString().includes('Cast to ObjectId failed for value')) {
        return res.status(404).send({ errors: { message: `Contato ${req.params.id} não encontrado` } })
      } else {
        return res.status(500).send({ errors: { message: err.toString() } })
      }
    }
  }

  async index(req, res) {
    try {
      const page = req.query.page || 1
      const limit = req.query.limit || 30

      const contactsQuery = new ContactsQuery()

      contactsQuery.page(page)
      contactsQuery.limit(limit)

      if (req.query.type) {
        contactsQuery.filterByType(req.query.type)
      }

      if (req.query.talkingWithChatbot) {
        contactsQuery.filterByTalkingWithChatbot(req.query.talkingWithChatbot)
      }

      if (req.query.licensee) {
        contactsQuery.filterByLicensee(req.query.licensee)
      }

      if (req.query.expression) {
        contactsQuery.filterByExpression(req.query.expression)
      }

      const contacts = await contactsQuery.all()

      res.status(200).send(contacts)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }
}

export { ContactsController }
