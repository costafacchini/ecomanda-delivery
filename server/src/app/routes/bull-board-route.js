const { createBullBoard } = require('bull-board')
const { BullMQAdapter } = require('bull-board/bullMQAdapter')
const queueServer = require('@config/queue')

const adapters = queueServer.queues.map((queue) => new BullMQAdapter(queue.bull), { readOnlyMode: true })

const { router } = createBullBoard(adapters)

module.exports = router
