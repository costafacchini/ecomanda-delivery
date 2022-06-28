const router = require('express').Router()
const jwt = require('jsonwebtoken')
const SECRET = process.env.SECRET
const UsersController = require('@controllers/UsersController')
const LicenseesController = require('@controllers/LicenseesController')
const ContactsController = require('@controllers/ContactsController')
const TriggersController = require('@controllers/TriggersController')
const MessagesController = require('@controllers/MessagesController')
const TemplatesController = require('@controllers/TemplatesController')

const usersController = new UsersController()
const licenseesController = new LicenseesController()
const contactsController = new ContactsController()
const triggersController = new TriggersController()
const messagesController = new MessagesController()
const templatesController = new TemplatesController()

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

router.post('/contacts/', contactsController.validations(), contactsController.create)
router.post('/contacts/:id', contactsController.validations(), contactsController.update)
router.get('/contacts/:id', contactsController.show)
router.get('/contacts/', contactsController.index)

router.post('/triggers/', triggersController.create)
router.post('/triggers/:id', triggersController.update)
router.get('/triggers/:id', triggersController.show)
router.get('/triggers/', triggersController.index)
router.post('/triggers/:id/importation', triggersController.importation)

router.post('/templates/', templatesController.create)
router.post('/templates/:id', templatesController.update)
router.get('/templates/:id', templatesController.show)
router.get('/templates/', templatesController.index)
router.post('/templates/:id/importation', templatesController.importation)

router.post('/licensees/:id/dialogwebhook', licenseesController.setDialogWebhook)

router.get('/messages/', messagesController.index)

module.exports = router
