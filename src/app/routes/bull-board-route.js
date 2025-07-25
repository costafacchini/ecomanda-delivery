const { createBullBoard } = require('@bull-board/api')
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter')
const { ExpressAdapter } = require('@bull-board/express')
const queueServer = require('@config/queue')

const adapters = queueServer.queues.map((queue) => new BullMQAdapter(queue.bull), { readOnlyMode: true })

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('queue')

createBullBoard({
  queues: adapters,
  serverAdapter: serverAdapter,
})

module.exports = serverAdapter.getRouter()
