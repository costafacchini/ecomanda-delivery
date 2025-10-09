import { createBullBoard  } from '@bull-board/api.js'
import { BullMQAdapter  } from '@bull-board/api/bullMQAdapter.js'
import { ExpressAdapter  } from '@bull-board/express.js'
import queueServer from '@config/queue.js'

const adapters = queueServer.queues.map((queue) => new BullMQAdapter(queue.bull), { readOnlyMode: true })

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('queue')

createBullBoard({
  queues: adapters,
  serverAdapter: serverAdapter,
})

export default serverAdapter.getRouter()
