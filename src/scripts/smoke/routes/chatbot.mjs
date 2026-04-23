import express from 'express'
import { appendState } from '../mock-state.mjs'

function createChatbotRouter() {
  const router = express.Router()

  router.post('/messages', (req, res) => {
    appendState('chatbot', 'messages', {
      body: req.body,
      headers: {
        authorization: req.headers.authorization || '',
      },
    })

    res.status(200).json({
      id: `smoke-chatbot-message-${Date.now()}`,
      ok: true,
    })
  })

  return router
}

export { createChatbotRouter }
