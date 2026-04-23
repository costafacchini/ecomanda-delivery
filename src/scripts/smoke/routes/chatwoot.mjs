import express from 'express'
import { appendState } from '../mock-state.mjs'

function createChatwootRouter() {
  const router = express.Router()

  router.post('/api/v1/conversations/:conversationId/messages', (req, res) => {
    appendState('chatwoot', 'messages', {
      conversationId: req.params.conversationId,
      headers: {
        apiAccessToken: req.headers['api_access_token'] || '',
      },
      body: req.body,
    })

    res.status(200).json({
      id: `smoke-chatwoot-message-${Date.now()}`,
    })
  })

  return router
}

export { createChatwootRouter }
