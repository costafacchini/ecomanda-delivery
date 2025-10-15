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

const router = express.Router()

const chatsController = new ChatsController()
const chatbotsController = new ChatbotsController()
const messengersController = new MessengersController()
const backupsController = new BackupsController()
const adressesController = new AdressesController()
const cartsController = new CartsController()
const delayController = new DelayController()
const backgroundjobsController = new BackgroundjobsController()
const integrationsController = new IntegrationsController()
const ordersController = new OrdersController()

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
