const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const SECRET = process.env.SECRET
const { create, update, show, index, validations } = require('@controllers/users-controller')

router.route('*').all(authenticate, (req, res, next) => {
  next()
})

function authenticate(req, res, next) {
  const token = req.headers['x-access-token']
  if (!token) return res.status(401).json({ auth: false, message: 'Token não informado.' })

  jwt.verify(token, SECRET, function (err, decoded) {
    if (err) return res.status(500).json({ auth: false, message: 'Falha na autenticação com token.' })

    req.userId = decoded.id
    next()
  })
}

router.post('/users/', validations('create'), create)
router.post('/users/:id', validations('update'), update)
router.get('/users/:id', show)
router.get('/users/', index)

module.exports = router
