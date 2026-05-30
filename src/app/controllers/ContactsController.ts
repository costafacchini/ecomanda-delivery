import { check, validationResult } from 'express-validator'
import { sanitizeExpressErrors, sanitizeModelErrors } from '../helpers/SanitizeErrors'

class ContactsController {
  contactRepository: any
  createContactsQuery: any
  createContact: any
  updateContact: any

  constructor({ contactRepository, createContactsQuery, createContact, updateContact }: Record<string, any> = {}) {
    this.contactRepository = contactRepository
    this.createContactsQuery = createContactsQuery
    this.createContact = createContact
    this.updateContact = updateContact

    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.show = this.show.bind(this)
    this.index = this.index.bind(this)
  }

  validations() {
    return [
      check('email', 'Email deve ser preenchido com um valor válido')
        .optional({ checkFalsy: true })
        .isEmail()
        .normalizeEmail(),
    ]
  }

  async create(req: any, res: any) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: sanitizeExpressErrors(errors.array()) })
    }

    try {
      const contact = await this.createContact.execute(req.body)

      return res.status(201).send(contact)
    } catch (err) {
      if (err?.errors) {
        return res.status(422).send({ errors: sanitizeModelErrors(err.errors) })
      }

      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async update(req: any, res: any) {
    try {
      const contact = await this.updateContact.execute(req.params.id, req.body)

      return res.status(200).send(contact)
    } catch (err) {
      if (err?.errors) {
        return res.status(422).send({ errors: sanitizeModelErrors(err.errors) })
      }

      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async show(req: any, res: any) {
    try {
      const contact = await this.contactRepository.findFirst({ _id: req.params.id }, ['licensee'])

      res.status(200).send(contact)
    } catch (err) {
      if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(404).send({ errors: { message: `Contato ${req.params.id} não encontrado` } })
      } else {
        return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
      }
    }
  }

  async index(req: any, res: any) {
    try {
      const page = req.query.page || 1
      const limit = req.query.limit || 30

      const contactsQuery = this.createContactsQuery()

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

      if (req.query.isGroup !== undefined) {
        contactsQuery.filterByIsGroup(req.query.isGroup === 'true')
      }

      if (req.query.updatedAtStart) {
        contactsQuery.filterByUpdatedAtStart(new Date(req.query.updatedAtStart))
      }

      if (req.query.updatedAtEnd) {
        contactsQuery.filterByUpdatedAtEnd(new Date(req.query.updatedAtEnd))
      }

      const contacts = await contactsQuery.all()

      res.status(200).send(contacts)
    } catch (err) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }
}

export { ContactsController }
