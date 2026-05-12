import express from 'express'
import jwt from 'jsonwebtoken'
import { UsersController } from '../controllers/UsersController.js'
import { LicenseesController } from '../controllers/LicenseesController.js'
import { ContactsController } from '../controllers/ContactsController.js'
import { TriggersController } from '../controllers/TriggersController.js'
import { MessagesController } from '../controllers/MessagesController.js'
import { TemplatesController } from '../controllers/TemplatesController.js'
import { DashboardController } from '../controllers/DashboardController.js'
import { queueServer } from '../../config/queue.js'
import { redisConnection } from '../../config/redis.js'
import { LicenseesQuery } from '../queries/LicenseesQuery.js'
import { ContactsQuery } from '../queries/ContactsQuery.js'
import { TriggersQuery } from '../queries/TriggersQuery.js'
import { TemplatesQuery } from '../queries/TemplatesQuery.js'
import { MessagesQuery } from '../queries/MessagesQuery.js'
import { CreateLicensee } from '../usecases/licensees/CreateLicensee.js'
import { UpdateLicensee } from '../usecases/licensees/UpdateLicensee.js'
import { SetDialogWebhook } from '../usecases/licensees/SetDialogWebhook.js'
import { SendLicenseeToPagarMe } from '../usecases/licensees/SendLicenseeToPagarMe.js'
import { SignPedidos10OrderWebhook } from '../usecases/licensees/SignPedidos10OrderWebhook.js'
import { CreateContact } from '../usecases/contacts/CreateContact.js'
import { UpdateContact } from '../usecases/contacts/UpdateContact.js'
import { CreateTrigger } from '../usecases/triggers/CreateTrigger.js'
import { ImportFacebookCatalog } from '../usecases/triggers/ImportFacebookCatalog.js'
import { UpdateTrigger } from '../usecases/triggers/UpdateTrigger.js'
import { CreateUser } from '../usecases/users/CreateUser.js'
import { UpdateUser } from '../usecases/users/UpdateUser.js'
import { CreateMessage } from '../usecases/messages/CreateMessage.js'
import { createRuntimeDependencies } from '../runtime/dependencies.js'

const router = express.Router()
const SECRET = process.env.SECRET

// Composition root for resource routes. Each route module creates its own dependency set;
// repos are stateless so separate instances across route files are safe.
const {
  userRepository,
  licenseeRepository,
  contactRepository,
  triggerRepository,
  templateRepository,
  messageRepository,
  roomRepository,
  whatsappSessionRepository,
  createMessengerPlugin,
  createPagarMe,
  createPedidos10,
  createFacebookCatalogImporter,
  createTemplatesImporter,
} = createRuntimeDependencies()

const usersController = new UsersController({
  userRepository,
  createUser: new CreateUser({ userRepository }),
  updateUser: new UpdateUser({ userRepository }),
})
const licenseesController = new LicenseesController({
  licenseeRepository,
  createLicenseesQuery: () => new LicenseesQuery({ licenseeRepository }),
  createLicensee: new CreateLicensee({ licenseeRepository }),
  updateLicensee: new UpdateLicensee({ licenseeRepository }),
  setDialogWebhook: new SetDialogWebhook({ licenseeRepository, createMessengerPlugin }),
  sendLicenseeToPagarMe: new SendLicenseeToPagarMe({
    licenseeRepository,
    createPagarMe,
    pagarMeToken: process.env.PAGARME_TOKEN,
  }),
  signPedidos10OrderWebhook: new SignPedidos10OrderWebhook({ licenseeRepository, createPedidos10 }),
  createMessengerPlugin,
  whatsappSessionRepository,
})
const contactsController = new ContactsController({
  contactRepository,
  createContactsQuery: () => new ContactsQuery({ contactRepository }),
  createContact: new CreateContact({ contactRepository, jobQueue: queueServer }),
  updateContact: new UpdateContact({ contactRepository, jobQueue: queueServer }),
})
const triggersController = new TriggersController({
  triggerRepository,
  createTriggersQuery: () => new TriggersQuery({ triggerRepository }),
  createTrigger: new CreateTrigger({ triggerRepository }),
  updateTrigger: new UpdateTrigger({ triggerRepository }),
  importFacebookCatalog: new ImportFacebookCatalog({ createFacebookCatalogImporter }),
})
const messagesController = new MessagesController({
  createMessagesQuery: () => new MessagesQuery({ messageRepository }),
  userRepository,
  messageRepository,
  queueServer,
  createMessage: new CreateMessage({ messageRepository, contactRepository, jobQueue: queueServer }),
})
const dashboardController = new DashboardController({
  userRepository,
  licenseeRepository,
  contactRepository,
  messageRepository,
  roomRepository,
  redisConnection,
})
const templatesController = new TemplatesController({
  templateRepository,
  createTemplatesQuery: () => new TemplatesQuery({ templateRepository }),
  createTemplatesImporter,
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
router.get('/licensees/:id/baileys-status', licenseesController.getBaileysStatus)
router.post('/licensees/:id/baileys-qr', (req, res) => licenseesController.getBaileysQr(req, res))
router.post('/licensees/:id/sign-order-webhook', licenseesController.signOrderWebhook)
router.post('/licensees/:id/integration/pagarme', licenseesController.sendToPagarMe)

router.get('/messages', messagesController.index)
router.post('/messages', messagesController.create)
router.post('/messages/:id/resend', messagesController.resend)

router.get('/dashboard/licensees', dashboardController.licensees)
router.get('/dashboard/message-volume', dashboardController.messageVolume)
router.get('/dashboard/delivery-rate', dashboardController.deliveryRate)
router.get('/dashboard/queue', dashboardController.queue)
router.get('/dashboard/conversations', dashboardController.conversations)
router.get('/dashboard/contacts', dashboardController.contacts)
router.get('/dashboard/messages-today', dashboardController.messagesToday)
router.get('/dashboard/messages-per-day', dashboardController.messagesPerDay)

export default router
