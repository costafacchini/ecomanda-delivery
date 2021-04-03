const User = require('@models/user')
const { check, validationResult } = require('express-validator')
const _ = require('lodash')

// function permit(fields) {
//   const permitedFields = ['name', 'email', 'token']
//   if (permitedFields.password && permitedFields.password.trim().length > 8) permitedFields.push('password')
//
//   return _.pick(fields, permitedFields)
// }

function sanitizeErrors(errorsList) {
  return _.uniqWith(errorsList, _.isEqual).map(item => {
    return {
      mensagem: item.msg
    }
  })
}

function validate (method) {
  switch (method) {
    case 'create': {
      return [
        check('email', 'Email deve ser preenchido com um valor válido').exists().isEmail().custom(async value => {
          const user = await User.findOne({ email: value })
          if (user) {
            return Promise.reject(new Error('E-mail já cadastrado'))
          }
        }),
        check('password', 'Senha deve ter no mínimo 8 caracteres').exists().isLength({ min: 8 }),
        check('name', 'Nome deve ter no mínimo 4 caracteres').exists().isLength({ min: 4 })
      ]
    }
  }
}

async function create(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: sanitizeErrors(errors.array()) })
  }

  const { name, email, password } = req.body

  try {
    const user = await User.create({ name, email, password })

    res.status(201).send({ _id: user._id, name, email })
  } catch (err) {
    res.status(500).send({ errors: { mensagem: err.toString() } })
  }
}

async function edit() {

}

async function get() {

}

async function list() {

}

module.exports = { create, edit, get, list, validate }