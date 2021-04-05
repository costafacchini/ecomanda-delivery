const User = require('@models/user')
const { check, validationResult } = require('express-validator')
const _ = require('lodash')

function sanitizeErrors(errorsList) {
  return _.uniqWith(errorsList, _.isEqual).map((item) => {
    return {
      mensagem: item.msg,
    }
  })
}

function validations(method) {
  switch (method) {
    case 'create': {
      return [
        check('email', 'Email deve ser preenchido com um valor válido')
          .exists()
          .isEmail()
          .custom(async (value) => {
            const user = await User.findOne({ email: value })
            if (user) {
              return Promise.reject(new Error('E-mail já cadastrado'))
            }
          }),
        check('password', 'Senha deve ter no mínimo 8 caracteres').exists().isLength({ min: 8 }),
        check('name', 'Nome deve ter no mínimo 4 caracteres').exists().isLength({ min: 4 }),
      ]
    }

    case 'update': {
      return [
        check('password', 'Senha deve ter no mínimo 8 caracteres').optional().isLength({ min: 8 }),
        check('name', 'Nome deve ter no mínimo 4 caracteres').optional().isLength({ min: 4 }),
      ]
    }
  }
}

async function create(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: sanitizeErrors(errors.array()) })
  }

  const { name, email, password, active } = req.body

  try {
    const user = await User.create({ name, email, password, active })

    res.status(201).send({ _id: user._id, name, email, active })
  } catch (err) {
    res.status(500).send({ errors: { mensagem: err.toString() } })
  }
}

async function update(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: sanitizeErrors(errors.array()) })
  }

  const fields = permit(req.body)

  try {
    await User.updateOne({ _id: req.params.id }, { $set: fields })

    const user = await User.findOne({ _id: req.params.id })
    const { _id, name, email, active } = user

    res.status(200).send({ _id, name, email, active })
  } catch (err) {
    res.status(500).send({ errors: { mensagem: err.toString() } })
  }
}

async function show(req, res) {
  try {
    const user = await User.findOne({ _id: req.params.id })
    const { _id, name, email, active } = user

    res.status(200).send({ _id, name, email, active })
  } catch (err) {
    if (err.toString().includes('Cast to ObjectId failed for value')) {
      return res.status(404).send({ errors: { mensagem: 'Usuário 12312 não encontrado' } })
    } else {
      return res.status(500).send({ errors: { mensagem: err.toString() } })
    }
  }
}

async function index(req, res) {

}

function permit(fields) {
  const permitedFields = ['name', 'active', 'password']
  if (permitedFields.password && permitedFields.password.trim().length > 8) permitedFields.push('password')

  return _.pick(fields, permitedFields)
}

module.exports = { create, update, show, index, validations }