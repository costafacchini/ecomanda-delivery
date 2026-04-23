import express from 'express'
import { appendState } from '../mock-state.mjs'

function createYCloudRouter() {
  const router = express.Router()

  router.post('/whatsapp/messages/sendDirectly', (req, res) => {
    appendState('ycloud', 'messages', {
      headers: {
        apiKey: req.headers['x-api-key'] || '',
      },
      body: req.body,
    })

    res.status(201).json({
      id: `smoke-ycloud-message-${Date.now()}`,
    })
  })

  router.post('/whatsapp/media/:phoneNumber/upload', (req, res) => {
    appendState('ycloud', 'uploads', {
      phoneNumber: req.params.phoneNumber,
      headers: {
        apiKey: req.headers['x-api-key'] || '',
      },
    })

    res.status(201).json({
      id: `smoke-ycloud-media-${Date.now()}`,
    })
  })

  router.post('/webhookEndpoints', (req, res) => {
    appendState('ycloud', 'webhooks', {
      body: req.body,
    })

    res.status(201).json({
      id: `smoke-ycloud-webhook-${Date.now()}`,
      url: req.body?.url || '',
    })
  })

  return router
}

export { createYCloudRouter }
