require('dotenv').config()
require('module-alias/register')
require('@models/index')

const queueServer = require('@config/queue')

async function schedule() {
  await queueServer.addJob('reset-chatbots')

  // process.exit()
}

schedule()
