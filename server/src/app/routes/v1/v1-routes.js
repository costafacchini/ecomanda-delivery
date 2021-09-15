const router = require('express').Router()
const ChatsController = require('@controllers/ChatsController')
const ChatbotsController = require('@controllers/ChatbotsController')
const MessengersController = require('@controllers/MessengersController')
const ImportationsController = require('@controllers/ImportationsController')

const chatsController = new ChatsController()
const chatbotsController = new ChatbotsController()
const messengersController = new MessengersController()
const importationsController = new ImportationsController()

router.post('/chat/message', chatsController.message)

router.post('/chatbot/message', chatbotsController.message)
router.post('/chatbot/transfer', chatbotsController.transfer)

router.post('/messenger/message', messengersController.message)

router.post('/importations', importationsController.schedule)

module.exports = router
