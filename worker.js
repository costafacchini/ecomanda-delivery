require('dotenv').config()
require('module-alias/register')

const WorkerResolver = require('./app/worker/resover')
const WorkerDispatcher = require('./app/worker/dispatcher')

new WorkerResolver('resolver')
new WorkerDispatcher('dispatcher')
