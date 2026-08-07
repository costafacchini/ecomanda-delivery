import { Request, Response } from 'express'
import { check, validationResult } from 'express-validator'
import { sanitizeExpressErrors, sanitizeModelErrors } from '../helpers/SanitizeErrors'
import { IRepository } from '@repositories/repository'
import { IUser } from '../../types'
import { CreateUser } from '../usecases/users/CreateUser'
import { UpdateUser } from '../usecases/users/UpdateUser'
import { UsersQuery } from '../queries/UsersQuery'

class UsersController {
  userRepository: IRepository<IUser>
  createUser: CreateUser
  updateUser: UpdateUser
  createUsersQuery: () => UsersQuery

  constructor({
    userRepository,
    createUser,
    updateUser,
    createUsersQuery,
  }: {
    userRepository?: IRepository<IUser>
    createUser?: CreateUser
    updateUser?: UpdateUser
    createUsersQuery?: () => UsersQuery
  } = {}) {
    this.userRepository = userRepository!
    this.createUser = createUser!
    this.updateUser = updateUser!
    this.createUsersQuery = createUsersQuery!

    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.show = this.show.bind(this)
    this.index = this.index.bind(this)
  }

  validations() {
    return [check('email', 'Email deve ser preenchido com um valor válido').optional().isEmail()]
  }

  async create(req: Request, res: Response) {
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

  async update(req: Request, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
    }

    try {
      const user = await this.updateUser.execute(req.params.id as string, req.body)
      const { _id, name, email, active } = user!

      res.status(200).send({ _id, name, email, active })
    } catch (err: any) {
      if ('errors' in err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }

      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async show(req: Request, res: Response) {
    try {
      const user = (req.params.id as string).includes('@')
        ? await this.userRepository.findFirst({ email: req.params.id as string }, ['licensee'])
        : await this.userRepository.findFirst({ _id: req.params.id as string }, ['licensee'])

      res.status(200).send(user)
    } catch (err: any) {
      if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(404).send({ errors: { message: 'Usuário não encontrado' } })
      } else {
        return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
      }
    }
  }

  async index(req: Request, res: Response) {
    try {
      const page = req.query.page || 1
      const limit = req.query.limit || 30

      const usersQuery = this.createUsersQuery()

      usersQuery.page(page as number)
      usersQuery.limit(limit as number)

      if (req.query.expression) {
        usersQuery.filterByExpression(req.query.expression as string)
      }

      if (req.query.licensee) {
        usersQuery.filterByLicensee(req.query.licensee as string)
      }

      if (req.query.active) {
        ;(usersQuery as any).filterByActive()
      }

      const users = await usersQuery.all()

      res.status(200).send(users)
    } catch (err: any) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }
}

export { UsersController }
