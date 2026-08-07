import { Request, Response } from 'express'
import { check, validationResult } from 'express-validator'
import { sanitizeExpressErrors, sanitizeModelErrors } from '../helpers/SanitizeErrors'
import { IRepository } from '@repositories/repository'
import { IContact, IUser } from '../../types'
import { CreateContact } from '../usecases/contacts/CreateContact'
import { UpdateContact } from '../usecases/contacts/UpdateContact'
import { ContactsQuery } from '../queries/ContactsQuery'

class ContactsController {
  contactRepository: IRepository<IContact>
  userRepository: IRepository<IUser>
  createContactsQuery: () => ContactsQuery
  createContact: CreateContact
  updateContact: UpdateContact

  constructor({
    contactRepository,
    userRepository,
    createContactsQuery,
    createContact,
    updateContact,
  }: {
    contactRepository?: IRepository<IContact>
    userRepository?: IRepository<IUser>
    createContactsQuery?: () => ContactsQuery
    createContact?: CreateContact
    updateContact?: UpdateContact
  } = {}) {
    this.contactRepository = contactRepository!
    this.userRepository = userRepository!
    this.createContactsQuery = createContactsQuery!
    this.createContact = createContact!
    this.updateContact = updateContact!

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

  async create(req: Request, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: sanitizeExpressErrors(errors.array()) })
    }

    try {
      const contact = await this.createContact.execute(req.body)

      return res.status(201).send(contact)
    } catch (err: any) {
      if (err?.errors) {
        return res.status(422).send({ errors: sanitizeModelErrors(err.errors) })
      }

      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const contact = await this.updateContact.execute(req.params.id as string, req.body)

      return res.status(200).send(contact)
    } catch (err: any) {
      if (err?.errors) {
        return res.status(422).send({ errors: sanitizeModelErrors(err.errors) })
      }

      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async show(req: Request, res: Response) {
    try {
      const contact = await this.contactRepository.findFirst({ _id: req.params.id as string }, ['licensee'])

      res.status(200).send(contact)
    } catch (err: any) {
      if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(404).send({ errors: { message: `Contato ${req.params.id as string} não encontrado` } })
      } else {
        return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
      }
    }
  }

  async index(req: Request, res: Response) {
    try {
      const page = req.query.page || 1
      const limit = req.query.limit || 30

      const contactsQuery = this.createContactsQuery()

      contactsQuery.page(page as number)
      contactsQuery.limit(limit as number)

      const user = await this.userRepository.findFirst({ _id: req.userId })

      if (user?.role !== 'super') {
        contactsQuery.filterByLicensee(user?.licensee as string)
      } else if (req.query.licensee) {
        contactsQuery.filterByLicensee(req.query.licensee as string)
      }

      if (req.query.type) {
        contactsQuery.filterByType(req.query.type as string)
      }

      if (req.query.talkingWithChatbot) {
        contactsQuery.filterByTalkingWithChatbot(req.query.talkingWithChatbot === 'true')
      }

      if (req.query.expression) {
        contactsQuery.filterByExpression(req.query.expression as string)
      }

      if (req.query.isGroup !== undefined) {
        contactsQuery.filterByIsGroup(req.query.isGroup === 'true')
      }

      if (req.query.updatedAtStart) {
        contactsQuery.filterByUpdatedAtStart(new Date(req.query.updatedAtStart as string))
      }

      if (req.query.updatedAtEnd) {
        contactsQuery.filterByUpdatedAtEnd(new Date(req.query.updatedAtEnd as string))
      }

      const contacts = await contactsQuery.all()

      res.status(200).send(contacts)
    } catch (err: any) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }
}

export { ContactsController }
