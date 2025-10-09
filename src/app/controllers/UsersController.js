import User from '@models/User.js'
import { check, validationResult } from 'express-validator'
import { sanitizeExpressErrors, sanitizeModelErrors } from '../helpers/SanitizeErrors.js'
import _ from 'lodash'

function permit(fields) {
  const permitedFields = ['name', 'active', 'password', 'isAdmin', 'isSuper', 'email']

  return _.pick(fields, permitedFields)
}

class UsersController {
  validations() {
    return [check('email', 'Email deve ser preenchido com um valor válido').optional().isEmail()]
  }

  async create(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
    }

    const { name, email, password, active, licensee, isAdmin, isSuper } = req.body

    const user = new User({ name, email, password, active, licensee, isAdmin, isSuper })
    const validation = user.validateSync()

    try {
      if (validation) {
        return res.status(422).json({ errors: sanitizeModelErrors(validation.errors) })
      } else {
        await user.save()
      }

      res.status(201).send({ _id: user._id, name, email, active, isAdmin, isSuper, licensee })
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async update(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
    }

    const fields = permit(req.body)

    try {
      await User.updateOne({ _id: req.params.id }, { $set: fields }, { runValidators: true })
    } catch (err) {
      return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
    }

    try {
      const user = await User.findOne({ _id: req.params.id })
      const { _id, name, email, active } = user

      res.status(200).send({ _id, name, email, active })
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async show(req, res) {
    try {
      const user = req.params.id.includes('@')
        ? await User.findOne({ email: req.params.id })
        : await User.findOne({ _id: req.params.id })

      res.status(200).send(user)
    } catch (err) {
      if (err.toString().includes('Cast to ObjectId failed for value')) {
        return res.status(404).send({ errors: { message: 'Usuário não encontrado' } })
      } else {
        return res.status(500).send({ errors: { message: err.toString() } })
      }
    }
  }

  async index(req, res) {
    try {
      res.status(200).send(await User.find({}, { password: 0 }))
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }
}

export default UsersController
