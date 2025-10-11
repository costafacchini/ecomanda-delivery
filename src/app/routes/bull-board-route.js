import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import queueServer from '@config/queue'

const adapters = queueServer.queues.map((queue) => new BullMQAdapter(queue.bull), { readOnlyMode: true })

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('queue')

createBullBoard({
  queues: adapters,
  serverAdapter: serverAdapter,
})

export default serverAdapter.getRouter()
