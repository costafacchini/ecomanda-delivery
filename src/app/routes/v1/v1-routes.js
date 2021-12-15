const router = require('express').Router()
const ChatsController = require('@controllers/ChatsController')
const ChatbotsController = require('@controllers/ChatbotsController')
const MessengersController = require('@controllers/MessengersController')
const ImportationsController = require('@controllers/ImportationsController')
const BackupsController = require('@controllers/BackupsController')
const AdressesController = require('@controllers/Contacts/AdressesController')

const chatsController = new ChatsController()
const chatbotsController = new ChatbotsController()
const messengersController = new MessengersController()
const importationsController = new ImportationsController()
const backupsController = new BackupsController()
const adressesController = new AdressesController()

router.post('/chat/message', chatsController.message)

router.post('/chatbot/message', chatbotsController.message)
router.post('/chatbot/transfer', chatbotsController.transfer)
router.post('/chatbot/reset', chatbotsController.reset)

router.post('/messenger/message', messengersController.message)

router.post('/importations', importationsController.schedule)

router.post('/backups/schedule', backupsController.schedule)
router.post('/backups/clear', backupsController.clear)

router.get('/contacts/address/:number', adressesController.show)
router.post('/contacts/address/:number', adressesController.update)

module.exports = router
