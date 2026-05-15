import { check, validationResult } from 'express-validator'
import { sanitizeExpressErrors, sanitizeModelErrors } from '../helpers/SanitizeErrors.js'

class UsersController {
  constructor({ userRepository, createUser, updateUser } = {}) {
    this.userRepository = userRepository
    this.createUser = createUser
    this.updateUser = updateUser

    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.show = this.show.bind(this)
    this.index = this.index.bind(this)
  }

  validations() {
    return [check('email', 'Email deve ser preenchido com um valor válido').optional().isEmail()]
  }

  async create(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
    }

    const { name, email, password, active, licensee, isAdmin, isSuper } = req.body

    try {
      const user = await this.createUser.execute({ name, email, password, active, licensee, isAdmin, isSuper })

      res.status(201).send({ _id: user._id, name, email, active, isAdmin, isSuper, licensee })
    } catch (err) {
      if ('errors' in err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }
      res.status(500).send({ errors: { message: 'Erro interno do servidor.' } })
    }
  }

  async update(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
    }

    try {
      const user = await this.updateUser.execute(req.params.id, req.body)
      const { _id, name, email, active } = user

      res.status(200).send({ _id, name, email, active })
    } catch (err) {
      if ('errors' in err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }

      res.status(500).send({ errors: { message: 'Erro interno do servidor.' } })
    }
  }

  async show(req, res) {
    try {
      const user = req.params.id.includes('@')
        ? await this.userRepository.findFirst({ email: req.params.id })
        : await this.userRepository.findFirst({ _id: req.params.id })

      res.status(200).send(user)
    } catch (err) {
      if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(404).send({ errors: { message: 'Usuário não encontrado' } })
      } else {
        return res.status(500).send({ errors: { message: 'Erro interno do servidor.' } })
      }
    }
  }

  async index(req, res) {
    try {
      res.status(200).send(await this.userRepository.find({}, { password: 0 }))
    } catch {
      res.status(500).send({ errors: { message: 'Erro interno do servidor.' } })
    }
  }
}

export { UsersController }
