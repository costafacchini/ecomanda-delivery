import express from 'express'
import { ChatsController } from '../../controllers/ChatsController.js'
import { ChatbotsController } from '../../controllers/ChatbotsController.js'
import { MessengersController } from '../../controllers/MessengersController.js'
import { BackupsController } from '../../controllers/BackupsController.js'
import { AdressesController } from '../../controllers/Contacts/AdressesController.js'
import { CartsController } from '../../controllers/CartsController.js'
import { DelayController } from '../../controllers/DelayController.js'
import { BackgroundjobsController } from '../../controllers/BackgroundjobsController.js'
import { IntegrationsController } from '../../controllers/IntegrationsController.js'
import { OrdersController } from '../../controllers/OrdersController.js'
import { queueServer } from '../../../config/queue.js'
import { publishMessage } from '../../../config/rabbitmq.js'
import { BodyRepositoryDatabase } from '../../repositories/body.js'
import { ContactRepositoryDatabase } from '../../repositories/contact.js'
import { CartRepositoryDatabase } from '../../repositories/cart.js'
import { MessageRepositoryDatabase } from '../../repositories/message.js'
import { BackgroundjobRepositoryDatabase } from '../../repositories/backgroundjob.js'
import { IntegrationlogRepositoryDatabase } from '../../repositories/integrationlog.js'
import { NormalizePhone } from '../../helpers/NormalizePhone.js'
import { parseCart } from '../../helpers/ParseTriggerText.js'
import { createCartAdapter } from '../../plugins/carts/adapters/factory.js'
import { createCartPlugin } from '../../plugins/carts/factory.js'
import { scheduleSendMessageToMessenger } from '../../repositories/messenger.js'

const router = express.Router()

const bodyRepository = new BodyRepositoryDatabase()
const contactRepository = new ContactRepositoryDatabase()
const cartRepository = new CartRepositoryDatabase()
const messageRepository = new MessageRepositoryDatabase()
const backgroundjobRepository = new BackgroundjobRepositoryDatabase()
const integrationlogRepository = new IntegrationlogRepositoryDatabase()

const chatsController = new ChatsController({ bodyRepository, queueServer, publishMessage })
const chatbotsController = new ChatbotsController({ bodyRepository, queueServer, publishMessage })
const messengersController = new MessengersController({ bodyRepository, queueServer })
const backupsController = new BackupsController({ publishMessage })
const adressesController = new AdressesController({
  contactRepository,
  normalizePhone: (number) => new NormalizePhone(number),
})
const cartsController = new CartsController({
  contactRepository,
  cartRepository,
  messageRepository,
  createNormalizePhone: (number) => new NormalizePhone(number),
  parseCart,
  createCartAdapter,
  createCartPlugin,
  scheduleSendMessageToMessenger,
  publishMessage,
})
const delayController = new DelayController()
const backgroundjobsController = new BackgroundjobsController({ backgroundjobRepository, queueServer })
const integrationsController = new IntegrationsController({ bodyRepository, publishMessage })
const ordersController = new OrdersController({ integrationlogRepository, bodyRepository, queueServer })

router.post('/chat/message', chatsController.message)
router.post('/chat/reset', chatsController.reset)

router.post('/chatbot/message', chatbotsController.message)
router.post('/chatbot/transfer', chatbotsController.transfer)
router.post('/chatbot/reset', chatbotsController.reset)

router.post('/messenger/message', messengersController.message)

router.post('/backups/schedule', backupsController.schedule)
router.post('/backups/clear', backupsController.clear)

router.get('/contacts/address/:number', adressesController.show)
router.post('/contacts/address/:number', adressesController.update)

router.post('/carts/reset', cartsController.reset)
router.post('/carts', cartsController.create)
router.post('/carts/:contact', cartsController.update)
router.delete('/carts/:contact', cartsController.close)
router.get('/carts/:contact', cartsController.show)
router.post('/carts/:contact/item', cartsController.addItem)
router.delete('/carts/:contact/item', cartsController.removeItem)
router.post('/carts/:contact/send', cartsController.send)
router.get('/carts/:contact/cart', cartsController.getCart)
router.get('/carts/:contact/payment', cartsController.getPayment)

router.get('/delay/:time', delayController.time)
router.post('/delay/:time', delayController.time)

router.get('/backgroundjobs/:id', backgroundjobsController.show)
router.post('/backgroundjobs', backgroundjobsController.create)

router.post('/orders', ordersController.create)
router.post('/orders/change-status', ordersController.changeStatus)

router.post('/integrations', integrationsController.create)

export default router
