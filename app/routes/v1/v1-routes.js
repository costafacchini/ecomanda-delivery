const express = require('express')
const ChatsController = require('@controllers/chats-controller')
const ChatbotsController = require('@controllers/chatbots-controller')
const MessengersController = require('@controllers/messengers-controller')

const chatsController = new ChatsController()
const chatbotsController = new ChatbotsController()
const messengersController = new MessengersController()

const router = express.Router()

router.post('/chat/webhook', chatsController.create)

router.post('/chatbot/webhook', chatbotsController.create)
router.post('/chatbot/transfer', chatbotsController.change)

router.post('/messenger/webhook', messengersController.create)

module.exports = router
