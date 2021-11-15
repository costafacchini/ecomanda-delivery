const Contact = require('@models/Contact')
const { check, validationResult } = require('express-validator')
const { sanitizeExpressErrors, sanitizeModelErrors } = require('../helpers/SanitizeErrors')
const _ = require('lodash')
const ContactsQuery = require('@queries/ContactsQuery')

function permit(fields) {
  const permitedFields = ['name', 'number', 'type', 'talkingWithChatBot', 'licensee', 'waId', 'landbotId']

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
      return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
    }

    const { name, number, type, talkingWithChatBot, licensee, waId, landbotId } = req.body

    const contact = new Contact({
      name,
      number,
      type,
      talkingWithChatBot,
      licensee,
      waId,
      landbotId,
    })

    const validation = contact.validateSync()

    try {
      if (validation) {
        return res.status(422).json({ errors: sanitizeModelErrors(validation.errors) })
      } else {
        await contact.save()
      }

      res.status(201).send(contact)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async update(req, res) {
    const fields = permit(req.body)
    delete fields.licensee

    try {
      await Contact.updateOne({ _id: req.params.id }, { $set: fields }, { runValidators: true })
    } catch (err) {
      return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
    }

    try {
      const contact = await Contact.findOne({ _id: req.params.id })

      res.status(200).send(contact)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async show(req, res) {
    try {
      const contact = await Contact.findOne({ _id: req.params.id })

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
      const page = req.body.page || 1
      const limit = req.body.limit || 30

      const contactsQuery = new ContactsQuery()

      contactsQuery.page(page)
      contactsQuery.limit(limit)

      if (req.body.type) {
        contactsQuery.filterByType(req.body.type)
      }

      if (req.body.talkingWithChatbot) {
        contactsQuery.filterByTalkingWithChatbot(req.body.talkingWithChatbot)
      }

      if (req.body.licensee) {
        contactsQuery.filterByLicensee(req.body.licensee)
      }

      if (req.body.expression) {
        contactsQuery.filterByExpression(req.body.expression)
      }

      const messages = await contactsQuery.all()

      res.status(200).send(messages)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }
}

module.exports = ContactsController
