const express = require('express')
const ChatsController = require('@controllers/chats-controller')
const ChatbotsController = require('@controllers/chatbots-controller')
const MessengersController = require('@controllers/messengers-controller')

const chatsController = new ChatsController()
const chatbotsController = new ChatbotsController()
const messengersController = new MessengersController()

const router = express.Router()

router.post('/chat/message', chatsController.message)

router.post('/chatbot/message', chatbotsController.message)
router.post('/chatbot/transfer', chatbotsController.transfer)

router.post('/messenger/message', messengersController.message)

module.exports = router
