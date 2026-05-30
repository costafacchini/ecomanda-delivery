import express from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { sanitizeExpressErrors } from '../../helpers/SanitizeErrors'
import { ChatsController } from '../../controllers/ChatsController'
import { ChatbotsController } from '../../controllers/ChatbotsController'
import { MessengersController } from '../../controllers/MessengersController'
import { BackupsController } from '../../controllers/BackupsController'
import { AdressesController } from '../../controllers/Contacts/AdressesController'
import { CartsController } from '../../controllers/CartsController'
import { DelayController } from '../../controllers/DelayController'
import { BackgroundjobsController } from '../../controllers/BackgroundjobsController'
import { IntegrationsController } from '../../controllers/IntegrationsController'
import { OrdersController } from '../../controllers/OrdersController'
import { ReceivePedidos10Order } from '../../usecases/orders/ReceivePedidos10Order'
import { ChangePedidos10OrderStatus } from '../../usecases/orders/ChangePedidos10OrderStatus'
import { ScheduleBackgroundjob } from '../../usecases/backgroundjobs/ScheduleBackgroundjob'
import { GetBackgroundjobStatus } from '../../usecases/backgroundjobs/GetBackgroundjobStatus'
import { UpdateContactAddress } from '../../usecases/contacts/UpdateContactAddress'
import { CreateCart } from '../../usecases/carts/CreateCart'
import { UpdateCart } from '../../usecases/carts/UpdateCart'
import { AddCartItem } from '../../usecases/carts/AddCartItem'
import { SendCart } from '../../usecases/carts/SendCart'
import { IngestChatMessage } from '../../usecases/webhooks/IngestChatMessage'
import { IngestMessengerMessage } from '../../usecases/webhooks/IngestMessengerMessage'
import { queueServer } from '../../../config/queue'
import { publishMessage } from '../../../config/rabbitmq'
import { NormalizePhone } from '../../helpers/NormalizePhone'
import { createCartAdapter } from '../../plugins/carts/adapters/factory'
import { scheduleSendMessageToMessenger } from '../../repositories/messenger'
import { createRuntimeDependencies } from '../../runtime/dependencies'

const router = express.Router()

function validate(req: any, res: any, next: any) {
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
  normalizePhone: (number: any) => new NormalizePhone(number),
  updateContactAddress: new UpdateContactAddress({
    contactRepository,
    normalizePhone: (number: any) => new NormalizePhone(number),
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
    createNormalizePhone: (number: any) => new NormalizePhone(number),
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
