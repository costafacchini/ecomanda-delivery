import express from 'express'
import jwt from 'jsonwebtoken'
import { UsersController } from '../controllers/UsersController.js'
import { LicenseesController } from '../controllers/LicenseesController.js'
import { ContactsController } from '../controllers/ContactsController.js'
import { TriggersController } from '../controllers/TriggersController.js'
import { MessagesController } from '../controllers/MessagesController.js'
import { TemplatesController } from '../controllers/TemplatesController.js'
import { queueServer } from '../../config/queue.js'
import { UserRepositoryDatabase } from '../repositories/user.js'
import { LicenseeRepositoryDatabase } from '../repositories/licensee.js'
import { ContactRepositoryDatabase } from '../repositories/contact.js'
import { TriggerRepositoryDatabase } from '../repositories/trigger.js'
import { TemplateRepositoryDatabase } from '../repositories/template.js'
import { MessageRepositoryDatabase } from '../repositories/message.js'
import { LicenseesQuery } from '../queries/LicenseesQuery.js'
import { ContactsQuery } from '../queries/ContactsQuery.js'
import { TriggersQuery } from '../queries/TriggersQuery.js'
import { TemplatesQuery } from '../queries/TemplatesQuery.js'
import { MessagesQuery } from '../queries/MessagesQuery.js'
import { createMessengerPlugin } from '../plugins/messengers/factory.js'
import { PagarMe } from '../plugins/payments/PagarMe.js'
import { Pedidos10 } from '../plugins/integrations/Pedidos10.js'
import { FacebookCatalogImporter } from '../plugins/importers/facebook_catalog/index.js'
import { TemplatesImporter } from '../plugins/importers/template/index.js'

const router = express.Router()
const SECRET = process.env.SECRET

const userRepository = new UserRepositoryDatabase()
const licenseeRepository = new LicenseeRepositoryDatabase()
const contactRepository = new ContactRepositoryDatabase()
const triggerRepository = new TriggerRepositoryDatabase()
const templateRepository = new TemplateRepositoryDatabase()
const messageRepository = new MessageRepositoryDatabase()

const usersController = new UsersController({ userRepository })
const licenseesController = new LicenseesController({
  licenseeRepository,
  createLicenseesQuery: () => new LicenseesQuery({ licenseeRepository }),
  createMessengerPlugin,
  createPagarMe: () => new PagarMe(),
  createPedidos10: (licensee) => new Pedidos10(licensee),
})
const contactsController = new ContactsController({
  contactRepository,
  createContactsQuery: () => new ContactsQuery({ contactRepository }),
  queueServer,
})
const triggersController = new TriggersController({
  triggerRepository,
  createTriggersQuery: () => new TriggersQuery({ triggerRepository }),
  createFacebookCatalogImporter: (id) => new FacebookCatalogImporter(id),
})
const messagesController = new MessagesController({
  createMessagesQuery: () => new MessagesQuery({ messageRepository }),
})
const templatesController = new TemplatesController({
  templateRepository,
  createTemplatesQuery: () => new TemplatesQuery({ templateRepository }),
  createTemplatesImporter: (id) => new TemplatesImporter(id),
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

router.use(authenticate)

router.post('/users', usersController.validations(), usersController.create)
router.post('/users/:id', usersController.validations(), usersController.update)
router.get('/users/:id', usersController.show)
router.get('/users', usersController.index)

router.post('/licensees', licenseesController.validations(), licenseesController.create)
router.post('/licensees/:id', licenseesController.validations(), licenseesController.update)
router.get('/licensees/:id', licenseesController.show)
router.get('/licensees', licenseesController.index)

router.post('/contacts', contactsController.validations(), contactsController.create)
router.post('/contacts/:id', contactsController.validations(), contactsController.update)
router.get('/contacts/:id', contactsController.show)
router.get('/contacts', contactsController.index)

router.post('/triggers', triggersController.create)
router.post('/triggers/:id', triggersController.update)
router.get('/triggers/:id', triggersController.show)
router.get('/triggers', triggersController.index)
router.post('/triggers/:id/importation', triggersController.importation)

router.post('/templates', templatesController.create)
router.post('/templates/:id', templatesController.update)
router.get('/templates/:id', templatesController.show)
router.get('/templates', templatesController.index)
router.post('/templates/:id/importation', templatesController.importation)

router.post('/licensees/:id/dialogwebhook', licenseesController.setDialogWebhook)
router.post('/licensees/:id/sign-order-webhook', licenseesController.signOrderWebhook)
router.post('/licensees/:id/integration/pagarme', licenseesController.sendToPagarMe)

router.get('/messages', messagesController.index)

export default router
