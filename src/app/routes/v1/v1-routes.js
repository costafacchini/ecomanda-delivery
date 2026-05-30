import express from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { sanitizeExpressErrors } from '../../helpers/SanitizeErrors'
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
import { GetBackgroundjobStatus } from '../../usecases/backgroundjobs/GetBackgroundjobStatus.js'
import { UpdateContactAddress } from '../../usecases/contacts/UpdateContactAddress.js'
import { CreateCart } from '../../usecases/carts/CreateCart.js'
import { UpdateCart } from '../../usecases/carts/UpdateCart.js'
import { AddCartItem } from '../../usecases/carts/AddCartItem.js'
import { SendCart } from '../../usecases/carts/SendCart.js'
import { IngestChatMessage } from '../../usecases/webhooks/IngestChatMessage.js'
import { IngestMessengerMessage } from '../../usecases/webhooks/IngestMessengerMessage.js'
import { queueServer } from '../../../config/queue'
import { publishMessage } from '../../../config/rabbitmq'
import { NormalizePhone } from '../../helpers/NormalizePhone'
import { createCartAdapter } from '../../plugins/carts/adapters/factory.js'
import { scheduleSendMessageToMessenger } from '../../repositories/messenger'
import { createRuntimeDependencies } from '../../runtime/dependencies.js'

const router = express.Router()

function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
  }
  next()
}

function cartsCreateValidations() {
  return [
    body('contact').optional().isString().trim(),
    query('contact').optional().isString().trim(),
    body('name').optional().isString().trim(),
  ]
}

function cartsAddItemValidations() {
  return [
    param('contact').notEmpty().withMessage('contact é obrigatório').isString().trim(),
    body('products').isArray({ min: 1 }).withMessage('products deve ser um array com pelo menos um item'),
  ]
}

function ordersCreateValidations() {
  return [
    body('MerchantExternalCode').notEmpty().withMessage('MerchantExternalCode é obrigatório').isString().trim(),
    body('order').notEmpty().withMessage('order é obrigatório'),
  ]
}

function delayValidations() {
  return [param('time').isInt({ min: 0, max: 30000 }).withMessage('time deve ser um inteiro entre 0 e 30000')]
}

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
  updateContactAddress: new UpdateContactAddress({
    contactRepository,
    normalizePhone: (number) => new NormalizePhone(number),
  }),
})
const cartsController = new CartsController({
  contactRepository,
  cartRepository,
  parseCart,
  createCartPlugin,
  publishMessage,
  createCart: new CreateCart({
    contactRepository,
    cartRepository,
    createNormalizePhone: (number) => new NormalizePhone(number),
    createCartAdapter,
  }),
  updateCart: new UpdateCart({ contactRepository, cartRepository }),
  addCartItem: new AddCartItem({ contactRepository, cartRepository }),
  sendCart: new SendCart({
    contactRepository,
    cartRepository,
    messageRepository,
    parseCart,
    scheduleSendMessageToMessenger,
  }),
})
const delayController = new DelayController()
const backgroundjobsController = new BackgroundjobsController({
  scheduleBackgroundjob: new ScheduleBackgroundjob({ backgroundjobRepository, jobQueue: queueServer }),
  getBackgroundjobStatus: new GetBackgroundjobStatus({ backgroundjobRepository }),
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
router.post('/carts', cartsCreateValidations(), validate, cartsController.create)
router.post('/carts/:contact', cartsController.update)
router.delete('/carts/:contact', cartsController.close)
router.get('/carts/:contact', cartsController.show)
router.post('/carts/:contact/item', cartsAddItemValidations(), validate, cartsController.addItem)
router.delete('/carts/:contact/item', cartsController.removeItem)
router.post('/carts/:contact/send', cartsController.send)
router.get('/carts/:contact/cart', cartsController.getCart)
router.get('/carts/:contact/payment', cartsController.getPayment)

router.get('/delay/:time', delayValidations(), validate, delayController.time)
router.post('/delay/:time', delayValidations(), validate, delayController.time)

router.get('/backgroundjobs/:id', backgroundjobsController.show)
router.post('/backgroundjobs', backgroundjobsController.create)

router.post('/orders', ordersCreateValidations(), validate, ordersController.create)
router.post('/orders/change-status', ordersController.changeStatus)

router.post('/integrations', integrationsController.create)

export default router
