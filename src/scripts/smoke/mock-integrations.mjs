import express from 'express'
import { createChatwootRouter } from './routes/chatwoot.mjs'
import { createYCloudRouter } from './routes/ycloud.mjs'
import { createChatbotRouter } from './routes/chatbot.mjs'
import { getState, resetState } from './mock-state.mjs'

function createMockApp(name, router) {
  const app = express()

  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(router)

  app.get('/_smoke/health', (_, res) => {
    res.status(200).json({ ok: true, service: name })
  })

  app.get('/_smoke/state', (_, res) => {
    res.status(200).json(getState())
  })

  app.post('/_smoke/reset', (_, res) => {
    res.status(200).json(resetState())
  })

  return app
}

function startServer(app, port, label) {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.info(`${label} mock listening on ${port}`)
      resolve(server)
    })
  })
}

async function main(env = process.env) {
  const chatwootPort = Number.parseInt(env.SMOKE_CHATWOOT_PORT || '3101', 10)
  const ycloudPort = Number.parseInt(env.SMOKE_YCLOUD_PORT || '3102', 10)
  const chatbotPort = Number.parseInt(env.SMOKE_CHATBOT_PORT || '3103', 10)

  const chatwootApp = createMockApp('chatwoot', createChatwootRouter())
  const ycloudApp = createMockApp('ycloud', createYCloudRouter())
  const chatbotApp = createMockApp('chatbot', createChatbotRouter())

  const servers = await Promise.all([
    startServer(chatwootApp, chatwootPort, 'Chatwoot'),
    startServer(ycloudApp, ycloudPort, 'YCloud'),
    startServer(chatbotApp, chatbotPort, 'Chatbot'),
  ])

  const closeServers = async () => {
    await Promise.all(
      servers.map(
        (server) =>
          new Promise((resolve, reject) => {
            server.close((error) => {
              if (error) {
                reject(error)
              } else {
                resolve()
              }
            })
          }),
      ),
    )
    process.exit(0)
  }

  process.on('SIGTERM', closeServers)
  process.on('SIGINT', closeServers)
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exit(1)
})
