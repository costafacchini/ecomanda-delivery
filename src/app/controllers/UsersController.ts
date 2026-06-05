import { check, validationResult } from 'express-validator'
import { sanitizeExpressErrors, sanitizeModelErrors } from '../helpers/SanitizeErrors'

class UsersController {
  userRepository: any
  createUser: any
  updateUser: any
  createUsersQuery: any

  constructor({ userRepository, createUser, updateUser, createUsersQuery }: Record<string, any> = {}) {
    this.userRepository = userRepository
    this.createUser = createUser
    this.updateUser = updateUser
    this.createUsersQuery = createUsersQuery

    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.show = this.show.bind(this)
    this.index = this.index.bind(this)
  }

  validations() {
    return [check('email', 'Email deve ser preenchido com um valor válido').optional().isEmail()]
  }

  async create(req: any, res: any) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
    }

    const { name, email, password, active, licensee, role } = req.body

    try {
      const user = await this.createUser.execute({ name, email, password, active, licensee, role })

      res.status(201).send({ _id: user._id, name, email, active, role, licensee })
    } catch (err: any) {
      if ('errors' in err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async update(req: any, res: any) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
    }

    try {
      const user = await this.updateUser.execute(req.params.id, req.body)
      const { _id, name, email, active } = user

      res.status(200).send({ _id, name, email, active })
    } catch (err: any) {
      if ('errors' in err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }

      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async show(req: any, res: any) {
    try {
      const user = req.params.id.includes('@')
        ? await this.userRepository.findFirst({ email: req.params.id }, ['licensee'])
        : await this.userRepository.findFirst({ _id: req.params.id }, ['licensee'])

      res.status(200).send(user)
    } catch (err: any) {
      if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(404).send({ errors: { message: 'Usuário não encontrado' } })
      } else {
        return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
      }
    }
  }

  async index(req: any, res: any) {
    try {
      const page = req.query.page || 1
      const limit = req.query.limit || 30

      const usersQuery = this.createUsersQuery()

      usersQuery.page(page)
      usersQuery.limit(limit)

      if (req.query.expression) {
        usersQuery.filterByExpression(req.query.expression)
      }

      if (req.query.licensee) {
        usersQuery.filterByLicensee(req.query.licensee)
      }

      if (req.query.active) {
        usersQuery.filterByActive()
      }

      const users = await usersQuery.all()

      res.status(200).send(users)
    } catch (err: any) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }
}

export { UsersController }
