const express = require('express')
const ChatsController = require('@controllers/ChatsController')
const ChatbotsController = require('@controllers/ChatbotsController')
const MessengersController = require('@controllers/MessengersController')

const chatsController = new ChatsController()
const chatbotsController = new ChatbotsController()
const messengersController = new MessengersController()

const router = express.Router()

router.post('/chat/message', chatsController.message)

router.post('/chatbot/message', chatbotsController.message)
router.post('/chatbot/transfer', chatbotsController.transfer)

router.post('/messenger/message', messengersController.message)

module.exports = router
