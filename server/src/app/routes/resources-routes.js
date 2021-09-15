const router = require('express').Router()
const jwt = require('jsonwebtoken')
const SECRET = process.env.SECRET
const UsersController = require('@controllers/UsersController')
const LicenseesController = require('@controllers/LicenseesController')

const usersController = new UsersController()
const licenseesController = new LicenseesController()

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

router.post('/users/', usersController.validations(), usersController.create)
router.post('/users/:id', usersController.validations(), usersController.update)
router.get('/users/:id', usersController.show)
router.get('/users/', usersController.index)

router.post('/licensees/', licenseesController.validations(), licenseesController.create)
router.post('/licensees/:id', licenseesController.validations(), licenseesController.update)
router.get('/licensees/:id', licenseesController.show)
router.get('/licensees/', licenseesController.index)

module.exports = router
