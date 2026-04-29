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
import { ReceivePedidos10Order } from '../../usecases/orders/ReceivePedidos10Order.js'
import { ChangePedidos10OrderStatus } from '../../usecases/orders/ChangePedidos10OrderStatus.js'
import { ScheduleBackgroundjob } from '../../usecases/backgroundjobs/ScheduleBackgroundjob.js'
import { IngestChatMessage } from '../../usecases/webhooks/IngestChatMessage.js'
import { IngestMessengerMessage } from '../../usecases/webhooks/IngestMessengerMessage.js'
import { queueServer } from '../../../config/queue.js'
import { publishMessage } from '../../../config/rabbitmq.js'
import { NormalizePhone } from '../../helpers/NormalizePhone.js'
import { createCartAdapter } from '../../plugins/carts/adapters/factory.js'
import { scheduleSendMessageToMessenger } from '../../repositories/messenger.js'
import { createRuntimeDependencies } from '../../runtime/dependencies.js'

const router = express.Router()

// Composition root for v1 routes. Separate instance from resources-routes intentionally;
// each route module owns its own subset of dependencies.
const {
  bodyRepository,
  contactRepository,
  cartRepository,
  messageRepository,
  backgroundjobRepository,
  integrationlogRepository,
  parseCart,
  createCartPlugin,
} = createRuntimeDependencies()

const ingestChatMessage = new IngestChatMessage({ chatRepository: bodyRepository, jobQueue: queueServer })
const ingestMessengerMessage = new IngestMessengerMessage({
  messengerRepository: bodyRepository,
  jobQueue: queueServer,
})

const chatsController = new ChatsController({ ingestChatMessage, publishMessage })
const chatbotsController = new ChatbotsController({ bodyRepository, queueServer, publishMessage })
const messengersController = new MessengersController({ ingestMessengerMessage })
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
const backgroundjobsController = new BackgroundjobsController({
  backgroundjobRepository,
  scheduleBackgroundjob: new ScheduleBackgroundjob({ backgroundjobRepository, jobQueue: queueServer }),
})
const integrationsController = new IntegrationsController({ bodyRepository, publishMessage })
const ordersController = new OrdersController({
  receivePedidos10Order: new ReceivePedidos10Order({ integrationlogRepository, bodyRepository, jobQueue: queueServer }),
  changePedidos10OrderStatus: new ChangePedidos10OrderStatus({
    integrationlogRepository,
    bodyRepository,
    jobQueue: queueServer,
  }),
})

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
