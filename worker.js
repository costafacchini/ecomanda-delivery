const WorkerResolver = require('./app/worker/resover')
const WorkerDispatcher = require('./app/worker/dispatcher')

await new WorkerResolver('resolver')
await new WorkerDispatcher('dispatcher')
