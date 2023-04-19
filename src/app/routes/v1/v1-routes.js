const router = require('express').Router()
const ChatsController = require('@controllers/ChatsController')
const ChatbotsController = require('@controllers/ChatbotsController')
const MessengersController = require('@controllers/MessengersController')
const BackupsController = require('@controllers/BackupsController')
const AdressesController = require('@controllers/Contacts/AdressesController')
const CartsController = require('@controllers/CartsController')
const DelayController = require('@controllers/DelayController')

const chatsController = new ChatsController()
const chatbotsController = new ChatbotsController()
const messengersController = new MessengersController()
const backupsController = new BackupsController()
const adressesController = new AdressesController()
const cartsController = new CartsController()
const delayController = new DelayController()

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

router.post('/carts/', cartsController.create)
router.post('/carts/:contact', cartsController.update)
router.delete('/carts/:contact', cartsController.close)
router.get('/carts/:contact', cartsController.show)
router.post('/carts/:contact/item', cartsController.addItem)
router.delete('/carts/:contact/item', cartsController.removeItem)
router.post('/carts/:cart/send', cartsController.send)

router.get('/delay/:time', delayController.time)
router.post('/delay/:time', delayController.time)

module.exports = router
