const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const SECRET = process.env.SECRET
const { create: usersCreate, update: usersUpdate, show: usersShow, index: userIndex, validations: userValidations } = require('@controllers/users-controller')
const { create: licenseesCreate, update: licenseesUpdate, show: licenseesShow, index: licenseesIndex, validations: licenseesValidations } = require('@controllers/licensees-controller')

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

router.post('/users/', userValidations(), usersCreate)
router.post('/users/:id', userValidations(), usersUpdate)
router.get('/users/:id', usersShow)
router.get('/users/', userIndex)

router.post('/licensees/', licenseesValidations('create'), licenseesCreate)
router.post('/licensees/:id', licenseesValidations('update'), licenseesUpdate)
router.get('/licensees/:id', licenseesShow)
router.get('/licensees/', licenseesIndex)

module.exports = router
